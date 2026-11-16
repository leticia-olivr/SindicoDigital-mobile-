# SíndicoDigital API

API do projeto acadêmico SíndicoDigital.

## Tecnologias

- Node.js 22 LTS
- Express
- JavaScript (ES modules)
- PostgreSQL com `pg`

## Requisitos

- Node.js 22
- npm
- Git

## Instalação

1. Clone o repositório.
2. Execute `npm install`.
3. Copie `.env.example` para `.env`.
4. Preencha as variáveis localmente, quando houver um banco PostgreSQL provisionado.
5. Execute `npm run dev`.

## Verificação

`GET /health` retorna o estado da API. Por padrão, o servidor inicia na porta `3000`.

## Banco de dados

A conexão PostgreSQL é configurada pela variável `DATABASE_URL`. Nenhuma URL ou credencial deve ser adicionada ao código ou enviada ao GitHub. Confirme com a equipe qual provedor PostgreSQL será usado antes de preencher a variável.

## Segurança

Nunca publique o arquivo `.env` nem credenciais ou strings de conexão.