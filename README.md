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

O seed também cria 4 usuários de demonstração. Todos usam a senha `Demo@123`:

| E-mail | Tipo |
|---|---|
| `admin@sindicodigital.test` | `ADMIN` |
| `sindica@sindicodigital.test` | `SINDICO` |
| `morador1@sindicodigital.test` | `MORADOR` |
| `morador2@sindicodigital.test` | `MORADOR` |

## Autenticação

A API usa JWT. Configure no `.env` as variáveis `JWT_SECRET`, com um valor longo e aleatório, e `JWT_EXPIRES_IN`, que define a validade do token (padrão `1h`). Para gerar um segredo:

```sh
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

Faça login e envie o token recebido no cabeçalho `Authorization: Bearer <token>` de cada requisição. Todas as rotas exigem token, exceto `POST /auth/signup` e `POST /auth/login`.

| Método | Rota | Descrição |
|---|---|---|
| `POST` | `/auth/signup` | Cadastra um usuário do tipo `MORADOR`. Corpo: `nome`, `email`, `senha` |
| `POST` | `/auth/login` | Retorna `token` e `usuario`. Corpo: `email`, `senha` |
| `GET` | `/auth/me` | Retorna o usuário autenticado |
| `POST` | `/auth/logout` | Revoga o token atual |

## Interface web de autenticação

O servidor disponibiliza uma interface de cadastro e login:

- `/cadastro` (também disponível na página inicial) cria uma conta de morador com nome, e-mail, senha e confirmação de senha.
- O cadastro envia `nome`, `email` e `senha` para `POST /auth/signup`; erros de validação e e-mail já cadastrado são exibidos no formulário.
- Após o cadastro, a pessoa é encaminhada para `/login`. Como o cadastro não vincula uma unidade, a tela informa que o morador deve solicitar o vínculo à administração do condomínio.
- `/login` autentica usando `POST /auth/login` e, em caso de sucesso, encaminha para `/painel/ocorrencias`.
## Usuários

| Método | Rota | Permissão |
|---|---|---|
| `GET` | `/usuarios` | `SINDICO` e `ADMIN` |
| `POST` | `/usuarios` | `SINDICO` e `ADMIN`. Somente `ADMIN` cria usuários `SINDICO` ou `ADMIN` |
| `GET` | `/usuarios/:id` | O próprio usuário, `SINDICO` e `ADMIN` |
| `PUT` | `/usuarios/:id` | O próprio usuário, `SINDICO` e `ADMIN`. Somente `ADMIN` altera o campo `tipo`. `SINDICO` não altera dados de `ADMIN` |
| `DELETE` | `/usuarios/:id` | `SINDICO` e `ADMIN`. `SINDICO` não exclui `ADMIN` |

No `PUT`, envie apenas os campos que serão alterados: `nome`, `email`, `senha` ou `tipo`.

## Segurança

Nunca publique o arquivo `.env` nem credenciais ou strings de conexão.

## Interface web de ocorrências

O servidor também disponibiliza páginas para consultar ocorrências. Elas usam o token que o login guarda em `sessionStorage` (chave `token`) e consomem as rotas da API, que não mudam:

| Página | Consome | O que mostra |
|---|---|---|
| `/painel/ocorrencias` | `GET /ocorrencias` | Lista com título, categoria, unidade (bloco e número), data e status |
| `/painel/ocorrencias/:id` | `GET /ocorrencias/:id` | Detalhe com a descrição completa |

- As páginas usam caminhos com o prefixo `/painel` para não colidir com as rotas da API `/ocorrencias`.
- Status exibidos em português: `ABERTA` (Aberta), `EM_ANDAMENTO` (Em andamento) e `CONCLUIDA` (Concluída). Datas seguem o formato pt-BR.
- Cada tela mostra carregamento, lista vazia (mensagem neutra, pois a API não informa se a conta está sem unidade vinculada) e erro de conexão ou da API, com o botão "Tentar novamente".
- Sem token, ou com resposta `401`, a pessoa é encaminhada para `/login`. Respostas `403` e `404` exibem mensagens específicas.
- Os arquivos ficam em `public/`: `ocorrencias.html` e `ocorrencias.js` (lista), `ocorrencia.html` e `ocorrencia.js` (detalhe), `painel-comum.js` (token, datas, status e tratamento de erros) e `painel.css`.
