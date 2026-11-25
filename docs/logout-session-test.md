# Testes de logout e gerenciamento de sessões

## Funcionalidades verificadas

- Login com credenciais válidas e geração de token JWT.
- Acesso à rota protegida `/auth/me` com token válido.
- Logout por meio de `POST /auth/logout`.
- Revogação do token utilizado na sessão.
- Bloqueio de acesso após o logout.

## Resultados dos testes manuais

| Teste | Resultado |
|---|---|
| Login | Token gerado com sucesso |
| GET /auth/me | HTTP 200 OK |
| POST /auth/logout | HTTP 204 No Content |
| GET /auth/me após logout | HTTP 401 Unauthorized |

## Conclusão

Os testes confirmaram que o token permite acesso enquanto a sessão está ativa e deixa de ser aceito após o logout.
