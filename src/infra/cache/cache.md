# Cache

Camada de cache da aplicação, usando **Redis**.

## Como funciona

O Redis é um banco NoSQL do tipo **chave / valor**, armazenado em memória. Cada informação em cache é salva sob uma chave única, e o valor é o dado serializado (normalmente JSON):

| Key                          | Value   |
| ---------------------------- | ------- |
| `condominiums:<ID>:dashboard` | `{...}` |

## Padrão de chaves

`<recurso>:<id>:<contexto>`, separado por `:`

- `condominiums:123:dashboard`
- `managers:456:profile`

Esse padrão deixa as chaves legíveis e facilita invalidar tudo de um recurso (ex.: `condominiums:123:*`).

## Contrato

`CacheRepository` é uma abstração: os use cases e repositórios dependem dela, não do Redis diretamente. Assim dá para trocar a implementação (ou usar uma em memória nos testes).

```ts
export abstract class CacheRepository {
	abstract set(key: string, value: string): Promise<void>
	abstract get(key: string): Promise<string | null>
	abstract delete(key: string): Promise<void>
}
```

## Boas práticas

- **Sempre defina TTL** (tempo de expiração) para evitar dado desatualizado eterno.
- **Invalide na escrita**: ao criar, atualizar ou cancelar algo de um condomínio, apague as chaves relacionadas (ex.: `condominiums:<ID>:dashboard`).
- **Cache é opcional**: se o Redis falhar, a aplicação deve seguir buscando no banco.
- **Cacheie só o que é caro e muito lido**. Hoje, o principal candidato é o dashboard do condomínio.

## Passo a passo: aplicando cache em um repositório

### 1. Injete o `CacheRepository`

No repositório Prisma onde o cache será usado, adicione a dependência no construtor:

```ts
@Injectable()
export class PrismaCondominiumsRepository implements CondominiumsRepository {
	constructor(
		private readonly prisma: PrismaService,
		private readonly cacheRepository: CacheRepository,
	) {}
}
```

> O módulo de database precisa importar o módulo de cache para o Nest conseguir resolver essa dependência.

### 2. Leia do cache antes de ir ao banco

A integração acontece no método que busca o dado que você quer cachear. O fluxo é:

1. Procura a chave no Redis.
2. **Achou?** Devolve o dado e pula a consulta no banco.
3. **Não achou?** Consulta o banco, salva no Redis e devolve.

```ts
async findDashboardbyCondominiumId(
	condominiumId: UniqueEntityId,
): Promise<CondominiumDashboard | null> {
	const cacheKey = `condominiums:${condominiumId.toString()}:dashboard`

	const cacheHit = await this.cacheRepository.get(cacheKey)

	if (cacheHit) {
		const cachedData = JSON.parse(cacheHit)

		return PrismaCondominiumDashboardMapper.toDomain(cachedData)
	}

	const dashboard = await this.prisma.condominium.findUnique({
		where: { id: condominiumId.toString() },
		include: {
			// maintenances, appointments, address...
		},
	})

	if (!dashboard) {
		return null
	}

	await this.cacheRepository.set(cacheKey, JSON.stringify(dashboard))

	return PrismaCondominiumDashboardMapper.toDomain(dashboard)
}
```

**Pontos de atenção:**

- **A chave identifica o cache.** O sufixo `dashboard` diferencia esse cache de outros do mesmo condomínio (ex.: `condominiums:123:maintenances`). Monte a chave uma vez só (`cacheKey`), para leitura e escrita nunca divergirem.
- **Salve o dado cru do Prisma, não a entidade.** `JSON.parse` devolve um objeto simples, sem os getters da entidade. Por isso o dado em cache passa pelo mapper (`toDomain`) do mesmo jeito que o dado do banco.
- **Datas voltam como string.** Depois do `JSON.parse`, campos como `scheduledAt` viram texto. Garanta que o mapper converta com `new Date(...)`.
- **Não cacheie `null`.** Se o condomínio não existe, apenas retorne `null`, sem salvar nada no Redis.

### 3. Apague o cache quando o dado mudar

Se o condomínio é alterado, o dashboard em cache fica desatualizado. Por isso, todo método que altera o dado deve apagar a chave:

```ts
async update(
	condominium: Pick<Condominium, 'name' | 'id' | 'unitsCount'>,
): Promise<Condominium> {
	const updatedCondominium = await this.prisma.condominium.update({
		where: { id: condominium.id.toValue() },
		data: {
			name: condominium.name,
			unitsCount: condominium.unitsCount,
		},
	})

	await this.cacheRepository.delete(
		`condominiums:${condominium.id.toString()}:dashboard`,
	)

	return PrismaCondominiumMapper.toDomain(updatedCondominium)
}
```

Na próxima leitura, o cache não existe mais: o dado vem atualizado do banco e é salvo de novo.

> **Atenção:** o dashboard também mostra manutenções e agendamentos. Então os repositórios de **maintenances** e **appointments** também devem apagar `condominiums:<ID>:dashboard` ao criar, atualizar ou cancelar um registro. O mesmo vale para o `delete` do condomínio.

## Configuração do Redis na aplicação

### 1. Suba o Redis com Docker

No `docker-compose.yml`, foi adicionado o serviço `cache`:

```yaml
cache:
  container_name: gestao-condominial-cache
  image: redis
  ports:
    - 6379:6379
  volumes:
    - cache-data:/data
```

O volume `cache-data` mantém os dados mesmo se o container reiniciar. Para subir:

```bash
docker compose up -d cache
```

### 2. Instale a dependência

O [ioredis](https://github.com/redis/ioredis) é o client que conecta o Node ao Redis:

```bash
pnpm add ioredis
```

### 3. Configure as envs

Em `src/infra/env/env.ts`, as variáveis do Redis já têm valores padrão. Em ambiente local, nem precisa declará-las no `.env`:

```ts
REDIS_HOST: z.string().optional().default('127.0.0.1'),
REDIS_PORT: z.coerce.number().optional().default(6379),
REDIS_DB: z.coerce.number().optional().default(0),
```

- `z.coerce.number()` converte o texto do `.env` para número.
- `REDIS_DB` escolhe qual banco do Redis usar (ele tem vários, de `0` a `15`). Útil para separar, por exemplo, testes e desenvolvimento.

Em produção, sobrescreva os valores no `.env`.

### 4. Crie o `RedisService`

`src/infra/cache/redis/redis.service.ts` é a conexão com o Redis. Ele **estende** a classe `Redis` do ioredis, então já tem todos os comandos (`get`, `set`, `del`...):

```ts
@Injectable()
export class RedisService extends Redis implements OnModuleDestroy {
	constructor(envService: EnvService) {
		super({
			host: envService.get('REDIS_HOST'),
			port: envService.get('REDIS_PORT'),
			db: envService.get('REDIS_DB'),
		})
	}

	onModuleDestroy() {
		return this.disconnect()
	}
}
```

O `onModuleDestroy` fecha a conexão quando a aplicação é encerrada, sem deixar conexão aberta.

### 5. Implemente o `CacheRepository` com Redis

`src/infra/cache/redis/redis-cache-repository.ts` é a implementação concreta do contrato:

```ts
@Injectable()
export class RedisCacheRepository implements CacheRepository {
	constructor(private redis: RedisService) {}

	async set(key: string, value: string): Promise<void> {
		await this.redis.set(key, value, 'EX', 60 * 15) // 15 minutos
	}

	get(key: string): Promise<string | null> {
		return this.redis.get(key)
	}

	async delete(key: string): Promise<void> {
		await this.redis.del(key)
	}
}
```

O `'EX', 60 * 15` é o **TTL**: o Redis apaga a chave sozinho depois de 15 minutos.

### 6. Crie o `CacheModule`

`src/infra/cache/cache.module.ts` liga tudo. Quando alguém pedir um `CacheRepository`, o Nest entrega o `RedisCacheRepository`:

```ts
@Module({
	imports: [EnvModule],
	providers: [
		RedisService,
		{
			provide: CacheRepository,
			useClass: RedisCacheRepository,
		},
	],
	exports: [CacheRepository],
})
export class CacheModule {}
```

Só o `CacheRepository` é exportado. O resto da aplicação não sabe que existe Redis por trás.

### 7. Importe no `DatabaseModule`

Em `src/infra/database/database.module.ts`, importe o `CacheModule` para os repositórios Prisma poderem receber o `CacheRepository` no construtor:

```ts
@Module({
	imports: [CacheModule],
	providers: [
		// ...
	],
})
export class DatabaseModule {}
```

## Estrutura de arquivos

```
src/infra/cache/
├── cache.md                      # esta documentação
├── cache.module.ts               # módulo Nest que expõe o CacheRepository
├── cache-repository.ts           # contrato (abstração)
└── redis/
    ├── redis.service.ts          # conexão com o Redis (ioredis)
    └── redis-cache-repository.ts # implementação do contrato com Redis
```

## Testes E2E do cache

O objetivo é garantir três comportamentos no repositório:

1. **Salva no cache** depois de buscar no banco.
2. **Lê do cache** nas próximas chamadas, sem ir ao banco.
3. **Apaga o cache** quando o dado é alterado.

### 1. Separe um banco do Redis para testes

Em `.env.test`, use outro `REDIS_DB`, para os testes não apagarem o cache de desenvolvimento:

```bash
REDIS_DB=1
```

### 2. Limpe o Redis no `test/setup-e2e.ts`

Assim cada execução começa com o cache vazio. Adicione ao setup atual:

```ts
import { Redis } from 'ioredis'
import { envSchema } from '@/infra/env/env'

// depois dos config({ path: ... })
const env = envSchema.parse(process.env)

const redis = new Redis({
	host: env.REDIS_HOST,
	port: env.REDIS_PORT,
	db: env.REDIS_DB,
})

beforeAll(async () => {
	await redis.flushdb()
	// ... prisma db push
})

afterAll(async () => {
	await dropTestSchema()
	await redis.quit()
})
```

- `flushdb()` apaga só o banco escolhido em `REDIS_DB`, não o Redis inteiro.
- `redis.quit()` fecha a conexão. Sem isso, o Vitest pode ficar travado no fim.
- O `envSchema.parse` precisa vir **depois** do `config()`, para ler os valores do `.env.test`.

### 3. Teste o repositório

Crie `src/infra/database/prisma/repositories/prisma-condominiums-repository.e2e-spec.ts`. O teste chama o repositório direto, sem HTTP:

```ts
import { INestApplication } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { CondominiumsRepository } from '@/domain/management/application/repositories/condominiums-repository'
import { UniqueEntityId } from '@/core/entities/unique-entity-id'
import { AppModule } from '@/infra/app.module'
import { CacheModule } from '@/infra/cache/cache.module'
import { CacheRepository } from '@/infra/cache/cache-repository'
import { DatabaseModule } from '@/infra/database/database.module'
import { PrismaService } from '@/infra/database/prisma/prisma.service'
import { ManagerFactory } from '@/test/factories/make-manager'

describe('Prisma Condominiums Repository (E2E)', () => {
	let app: INestApplication
	let prisma: PrismaService
	let managerFactory: ManagerFactory
	let cacheRepository: CacheRepository
	let condominiumsRepository: CondominiumsRepository

	beforeAll(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [AppModule, DatabaseModule, CacheModule],
			providers: [ManagerFactory],
		}).compile()

		app = moduleRef.createNestApplication()

		prisma = moduleRef.get(PrismaService)
		managerFactory = moduleRef.get(ManagerFactory)
		cacheRepository = moduleRef.get(CacheRepository)
		condominiumsRepository = moduleRef.get(CondominiumsRepository)

		await app.init()
	})

	afterAll(async () => {
		await app.close()
	})

	async function makeCondominium() {
		const manager = await managerFactory.makePrismaManager()

		const address = await prisma.address.create({
			data: {
				zipCode: '11060-001',
				street: 'Av. Ana Costa',
				number: 480,
				neighborhood: 'Gonzaga',
				city: 'Santos',
				state: 'SP',
				country: 'Brasil',
			},
		})

		return prisma.condominium.create({
			data: {
				name: 'Residencial Cache',
				slug: `residencial-cache-${address.id}`,
				managerId: manager.id.toString(),
				addressId: address.id,
			},
		})
	}

	it('should cache condominium dashboard', async () => {
		const condominium = await makeCondominium()

		await condominiumsRepository.findDashboardbyCondominiumId(
			new UniqueEntityId(condominium.id),
		)

		const cached = await cacheRepository.get(
			`condominiums:${condominium.id}:dashboard`,
		)

		expect(cached).not.toBeNull()
		expect(JSON.parse(cached!)).toMatchObject({ name: 'Residencial Cache' })
	})

	it('should return cached dashboard on subsequent calls', async () => {
		const condominium = await makeCondominium()

		await cacheRepository.set(
			`condominiums:${condominium.id}:dashboard`,
			JSON.stringify({
				name: 'Nome vindo do cache',
				maintenances: [],
				appointments: [],
				address: { street: 'Rua X', number: 1, city: 'Santos', state: 'SP' },
			}),
		)

		const dashboard = await condominiumsRepository.findDashboardbyCondominiumId(
			new UniqueEntityId(condominium.id),
		)

		expect(dashboard?.condominiumName).toBe('Nome vindo do cache')
	})

	it('should reset dashboard cache when updating the condominium', async () => {
		const condominium = await makeCondominium()
		const condominiumId = new UniqueEntityId(condominium.id)

		await cacheRepository.set(
			`condominiums:${condominium.id}:dashboard`,
			JSON.stringify({ empty: true }),
		)

		await condominiumsRepository.update({
			id: condominiumId,
			name: 'Novo nome',
			unitsCount: 10,
		})

		const cached = await cacheRepository.get(
			`condominiums:${condominium.id}:dashboard`,
		)

		expect(cached).toBeNull()
	})
})
```

**Como cada teste funciona:**

- **Salva no cache:** chama o repositório e confere se a chave apareceu no Redis com o dado do banco.
- **Lê do cache:** grava um valor "falso" no Redis antes de chamar o repositório. Se o retorno for o nome falso, o repositório não foi ao banco. Como o dado do cache também passa pelo mapper, o valor falso precisa ter o formato que o mapper espera (`maintenances`, `appointments`, `address`).
- **Apaga o cache:** grava qualquer valor, chama o `update` e confere se a chave sumiu.

> **Dica:** quando os repositórios de **maintenances** e **appointments** também apagarem o cache do dashboard, crie um teste igual ao terceiro para cada um deles (ex.: criar uma manutenção e conferir se `condominiums:<ID>:dashboard` virou `null`).