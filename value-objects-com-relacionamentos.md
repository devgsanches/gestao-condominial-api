# Value objects para dados com relacionamento

A rota `GET /v1/accounts/manager/profile` devolve o síndico junto com os condomínios dele e a cidade de cada condomínio. Essa resposta não é uma entidade. É um value object de leitura: `ManagerWithCondominiums`.

## Entidade e value object

`Manager` e `Condominium` são entidades. Cada uma tem identidade própria e pode ser criada, alterada ou removida.

`ManagerWithCondominiums` só descreve uma leitura. Ele junta, num único objeto, o que a tela do perfil precisa:

- dados do síndico
- lista de condomínios
- cidade do endereço de cada condomínio

Ele não é salvo no banco e não tem regra de alteração. Os IDs continuam como `UniqueEntityId` até a borda HTTP.

## Quem monta o relacionamento

O use case não junta as tabelas. Ele pede o objeto pronto ao repositório do recurso principal, o gestor:

```ts
const managerWithCondominiums =
  await this.managerRepository.findManagerWithCondominiums(managerId)
```

Se não existir, o use case devolve `ManagerNotFoundError`. Se existir, devolve o value object - de leitura.

O contrato fica em `ManagersRepository`:

```ts
abstract findManagerWithCondominiums(
  id: UniqueEntityId,
): Promise<ManagerWithCondominiums | null>
```

## Duas implementações do mesmo contrato

No Prisma, uma consulta traz o gestor com `include` de `condominiums` e `address`. O `PrismaManagerWithCondominiumsMapper` transforma esse resultado em `ManagerWithCondominiums.create(...)`.

No repositório em memória, o mesmo método filtra os condomínios do gestor, busca o endereço de cada um e também chama `ManagerWithCondominiums.create(...)`. Se o endereço não existir, o teste quebra com um erro explícito.

## Daí para a resposta HTTP

O controller recebe o value object e passa pelo `ManagerWithCondominiumsPresenter`. O presenter converte cada `UniqueEntityId` com `.toString()` e monta o JSON final daquela rota.

```
banco ou memória

  -> repositório do recurso principal declara contrato (domínio)/monta o método (infra)
  ManagerWithCondominiums

  -> repositório faz a query e, para retornar, chama um **mapper**, responsável por devolver na mesma estrutura do value-object

  (mapper é somente para o prisma, em repos in-memory, o próprio repositório chama o value-object através do método create, e o retorna.)


  -> use case captura value-object e repassa ao controller

  -> controller chama presenter -> que recebe o value-object e 'apresenta' a estrutura JSON correta daquela rota;
```
