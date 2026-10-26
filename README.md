# 🏢 API Gestão Condominial

API REST que serve um aplicativo mobile para **síndicos** gerenciarem seus condomínios: cadastro de condomínios, controle de manutenções (gerais e periódicas), contratos, documentos e agendamento de reuniões e assembleias.

Construída com **Node.js**, **TypeScript**, **NestJS** e **Prisma**, seguindo **SOLID**, **DDD** e **Clean Architecture**.

---

## 📌 Domínio

| Entidade | Descrição |
| --- | --- |
| **Síndico** | Usuário da aplicação. Gerencia apenas os condomínios que cadastrou. |
| **Condomínio** | Cadastrado e gerenciado por um síndico. |
| **Manutenção** | Pertence a um condomínio. Pode ser **geral** (pontual) ou **periódica** (mensal, trimestral ou semestral). |
| **Contrato** | Vinculado a uma manutenção periódica. |
| **Documento** | Arquivo anexado a um contrato (um contrato pode ter vários). |
| **Reunião** | Reunião ou assembleia agendada para um condomínio. |

---

## 🚀 Tecnologias

| Tecnologia | Uso |
| --- | --- |
| **Node.js + TypeScript** | Runtime e tipagem estática |
| **NestJS** | Framework modular e opinativo, com injeção de dependência |
| **Prisma** | ORM para comunicação com o PostgreSQL |
| **PostgreSQL** | Banco de dados relacional |
| **class-validator** | Validação de DTOs via decorators |
| **@nestjs/jwt + Passport** | Autenticação via JWT |
| **bcrypt** | Hash de senhas |
| **Vitest + unplugin-swc** | Testes unitários e E2E |
| **Docker** | Ambiente local com PostgreSQL |

---

## ✅ Requisitos Funcionais

### Autenticação e perfil
- [x] Deve ser possível autenticar um síndico com e-mail e senha;
- [x] Deve ser possível obter o perfil do síndico autenticado;

### Autorização
- [x] TODAS as rotas devem ser autenticadas (exceto, a de login)

### Condomínios
- [x] Deve ser possível que um síndico cadastre um condomínio;
- [x] Deve ser possível listar os condomínios do síndico;
- [x] Deve ser possível obter o total de condomínios do síndico;
- [x] Deve ser possível obter os detalhes de um condomínio;
- [x] Deve ser possível editar e remover um condomínio;

### Manutenções e contratos
- [x] Deve ser possível cadastrar manutenções gerais e periódicas;
- [x] Deve ser possível buscar manutenções por nome e tipo;
- [x] Deve ser possível editar (title e description) de uma manutenção;
- [x] Deve ser possível cadastrar um contrato para uma manutenção periódica;
- [x] Deve ser possível cancelar uma manutenção e, se a manutenção for periódica, invalidar o contrato equivalente;
- [x] Deve ser possível anexar documentos a um contrato;

### Reuniões e assembleias
- [x] Deve ser possível agendar reuniões e assembleias;
- [x] Deve ser possível listar as reuniões de um condomínio;
- [x] Deve ser possível cancelar uma reunião;

## 📏 Regras de Negócio

- [x] Um síndico pode cadastrar no máximo **50** condomínios;
- [x] Um síndico só pode visualizar e alterar os condomínios que cadastrou;
- [x] Apenas manutenções **periódicas** possuem contrato;
- [x] A periodicidade deve ser **mensal**, **trimestral** ou **semestral**;
- [x] Não é possível agendar reuniões em datas passadas;

## ⚙️ Requisitos Não-Funcionais

- [x] A senha do usuário deve ser armazenada com hash (bcrypt);
- [x] Os dados devem ser persistidos em PostgreSQL;
- [ ] Todas as listagens devem ser paginadas com **20 itens por página**;
- [x] O usuário deve ser identificado por um JWT;

---

## Remove cache (BIOME)
rm -rf ~/Library/Caches/dev.biomejs.biome

## Type-checking (verifica se há erro de ts na app, e não emite nenhum build )
pnpm tsc --noEmit

## Biome lint
pnpm run lint

## 🛠️ Como rodar o projeto

### Pré-requisitos
- Node.js 20+
- Docker e Docker Compose

### Passos

​```bash
# instalar dependências
npm install

# configurar variáveis de ambiente
cp .env.example .env

# subir o banco
docker compose up -d

# rodar migrations e seed
npx prisma migrate dev
npx prisma db seed

# iniciar em modo desenvolvimento
npm run start:dev
​```

### Testes

​```bash
npm run test       # unitários
npm run test:e2e   # end-to-end
​```

---

## 📁 Estrutura

# Core
- Camada de domínio > apenas contratos

- Camada de infra > implementação em si + replace no database.module.ts, de: contrato > equivalente a > feat na camada de infra

​```
src/
├── core/            # entidades base, Either, erros genéricos
├── domain/
│   └── management/
│       ├── application/   # casos de uso e contratos de repositório
│       └── enterprise/    # entidades e value objects
└── infra/           # NestJS: http, database (Prisma), auth
​```

@TODO: add .nvmrc file and define node version on package.json (current LTS version)