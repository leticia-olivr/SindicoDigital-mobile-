# SíndicoDigital API

API do projeto acadêmico SíndicoDigital.

## Tecnologias

- Node.js 22 LTS
- Express
- JavaScript (ES modules)
- PostgreSQL com `pg`, hospedado no [Neon](https://neon.tech)

## Requisitos

- Node.js 22
- npm
- Git

## Instalação

1. Clone o repositório.
2. Execute `npm install`.
3. Copie `.env.example` para `.env`.
4. Preencha `DATABASE_URL` com a connection string do banco Neon da equipe.
5. Execute `npm run db:check` para testar a conexão.
6. Execute `npm run dev`.

## Verificação

`GET /health` retorna o estado da API. Por padrão, o servidor inicia na porta `3000`.

## Banco de dados

O provedor PostgreSQL do projeto é o [Neon](https://neon.tech), na região AWS São Paulo (`sa-east-1`). A equipe usa um único banco compartilhado. Peça a connection string a quem administra o projeto no Neon, por um canal privado.

A conexão é configurada pela variável `DATABASE_URL`. Nenhuma URL ou credencial deve ser adicionada ao código ou enviada ao GitHub. Use a connection string com `sslmode=verify-full`, que exige conexão criptografada e verifica o certificado do servidor:

```
DATABASE_URL=postgresql://USUARIO:SENHA@HOST.sa-east-1.aws.neon.tech/neondb?sslmode=verify-full&channel_binding=require
```

### Teste de conexão

```sh
npm run db:check
```

O comando conecta ao banco e exibe o nome do banco e a versão do PostgreSQL. Em caso de falha, ele mostra o motivo, como `DATABASE_URL` ausente ou credenciais inválidas.

Consulte o [modelo de dados](docs/modelo-banco.md) para ver as tabelas, as chaves e o diagrama de relacionamentos.

### Migrations e dados fictícios

Com as dependências instaladas e `DATABASE_URL` apontando para um banco de desenvolvimento ou teste, execute:

```sh
npm run db:migrate
npm run db:seed
```

O primeiro comando aplica os arquivos SQL de `database/migrations` em ordem de nome e registra as migrations aplicadas em `schema_migrations`. Para evoluir o esquema, adicione um arquivo com o próximo prefixo numérico. Cada execução aplica as migrations pendentes em uma transação.

O segundo comando carrega dados fictícios a partir de `database/seeds` e pode ser repetido sem duplicar registros. Ele é bloqueado quando `NODE_ENV=production`.

O modelo inicial inclui 2 condomínios, 4 unidades, 3 moradores e 5 vínculos entre moradores e unidades. Cada condomínio tem duas unidades. O seed inclui um morador vinculado a mais de uma unidade e uma unidade vinculada a mais de um morador.

## Segurança

Nunca publique o arquivo `.env` nem credenciais ou strings de conexão.
