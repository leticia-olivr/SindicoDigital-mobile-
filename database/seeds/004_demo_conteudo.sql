-- Mais dados de demonstração. Senha dos usuários novos: Demo@123
-- O hash é o mesmo de morador1, gerado com bcrypt (10 rounds).

INSERT INTO condominios (codigo, nome)
VALUES ('demo-carvalho', 'Residencial Carvalho')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO unidades (condominio_id, bloco, numero)
SELECT condominios.id, dados.bloco, dados.numero
FROM (VALUES
    ('demo-ipe', 'A', '103'),
    ('demo-ipe', 'A', '104'),
    ('demo-jacaranda', 'B', '203'),
    ('demo-carvalho', 'C', '301'),
    ('demo-carvalho', 'C', '302')
) AS dados (codigo, bloco, numero)
JOIN condominios ON condominios.codigo = dados.codigo
ON CONFLICT (condominio_id, bloco, numero) DO NOTHING;

INSERT INTO usuarios (nome, email, senha_hash, tipo)
VALUES
    ('Morador Demo Três', 'morador3@sindicodigital.test',
     '$2b$10$Ube0AA.oRK5td/P7SbWGA.mVwllA518E0XJc/msbNiWqvvHpTt5hi', 'MORADOR'),
    ('Síndico Demo Dois', 'sindico2@sindicodigital.test',
     '$2b$10$Ube0AA.oRK5td/P7SbWGA.mVwllA518E0XJc/msbNiWqvvHpTt5hi', 'SINDICO')
ON CONFLICT (email) DO NOTHING;

INSERT INTO moradores (nome, email)
VALUES
    ('Diana Exemplo', 'diana@example.invalid'),
    ('Eduardo Exemplo', 'eduardo@example.invalid')
ON CONFLICT (email) DO NOTHING;

UPDATE moradores
SET usuario_id = (
    SELECT id FROM usuarios
    WHERE email = 'morador3@sindicodigital.test' AND tipo = 'MORADOR'
)
WHERE email = 'diana@example.invalid'
  AND usuario_id IS NULL;

INSERT INTO moradores_unidades (morador_id, unidade_id)
SELECT moradores.id, unidades.id
FROM (VALUES
    ('diana@example.invalid', 'demo-carvalho', 'C', '301'),
    ('eduardo@example.invalid', 'demo-carvalho', 'C', '302'),
    ('eduardo@example.invalid', 'demo-ipe', 'A', '103'),
    ('carla@example.invalid', 'demo-jacaranda', 'B', '203')
) AS dados (email, codigo, bloco, numero)
JOIN moradores ON moradores.email = dados.email
JOIN condominios ON condominios.codigo = dados.codigo
JOIN unidades ON unidades.condominio_id = condominios.id
    AND unidades.bloco = dados.bloco
    AND unidades.numero = dados.numero
ON CONFLICT (morador_id, unidade_id) DO NOTHING;

INSERT INTO usuarios_unidades (usuario_id, unidade_id, tipo_usuario)
SELECT usuarios.id, unidades.id, 'MORADOR'
FROM (VALUES
    ('morador1@sindicodigital.test', 'demo-ipe', 'A', '101'),
    ('morador1@sindicodigital.test', 'demo-ipe', 'A', '102'),
    ('morador2@sindicodigital.test', 'demo-ipe', 'A', '101'),
    ('morador3@sindicodigital.test', 'demo-carvalho', 'C', '301')
) AS dados (email, codigo, bloco, numero)
JOIN usuarios ON usuarios.email = dados.email AND usuarios.tipo = 'MORADOR'
JOIN condominios ON condominios.codigo = dados.codigo
JOIN unidades ON unidades.condominio_id = condominios.id
    AND unidades.bloco = dados.bloco
    AND unidades.numero = dados.numero
ON CONFLICT (usuario_id, unidade_id) DO NOTHING;

INSERT INTO usuarios_condominios (usuario_id, condominio_id)
SELECT usuarios.id, condominios.id
FROM (VALUES
    ('sindica@sindicodigital.test', 'demo-jacaranda'),
    ('sindico2@sindicodigital.test', 'demo-carvalho'),
    ('sindico2@sindicodigital.test', 'demo-ipe')
) AS dados (email, codigo)
JOIN usuarios ON usuarios.email = dados.email AND usuarios.tipo = 'SINDICO'
JOIN condominios ON condominios.codigo = dados.codigo
ON CONFLICT (usuario_id, condominio_id) DO NOTHING;

INSERT INTO sindicos_condominios (sindico_id, condominio_id)
SELECT usuarios.id, condominios.id
FROM (VALUES
    ('sindica@sindicodigital.test', 'demo-ipe'),
    ('sindica@sindicodigital.test', 'demo-jacaranda'),
    ('sindico2@sindicodigital.test', 'demo-carvalho')
) AS dados (email, codigo)
JOIN usuarios ON usuarios.email = dados.email AND usuarios.tipo = 'SINDICO'
JOIN condominios ON condominios.codigo = dados.codigo
ON CONFLICT (sindico_id, condominio_id) DO NOTHING;

INSERT INTO categorias_ocorrencias (nome, descricao)
VALUES
    ('Elétrica', 'Problemas na rede elétrica'),
    ('Limpeza', 'Áreas comuns e descarte'),
    ('Segurança', 'Acesso, portaria e câmeras'),
    ('Barulho', 'Ruído fora do horário')
ON CONFLICT (nome) DO NOTHING;

INSERT INTO comunicados (titulo, conteudo, autor_id)
SELECT dados.titulo, dados.conteudo, usuarios.id
FROM (VALUES
    ('Assembleia ordinária', 'Reunião no salão do Residencial Ipê, terça às 19h.', 'sindica@sindicodigital.test'),
    ('Manutenção do elevador', 'O elevador do bloco A fica parado na quinta, das 8h às 12h.', 'sindica@sindicodigital.test'),
    ('Nova portaria', 'O horário da portaria do Carvalho passa a ser 24 horas.', 'sindico2@sindicodigital.test'),
    ('Aviso administrativo', 'Atualizem o cadastro de moradores até o fim do mês.', 'admin@sindicodigital.test')
) AS dados (titulo, conteudo, email)
JOIN usuarios ON usuarios.email = dados.email
WHERE NOT EXISTS (
    SELECT 1 FROM comunicados WHERE comunicados.titulo = dados.titulo
);

INSERT INTO ocorrencias (usuario_id, unidade_id, categoria_id, titulo, descricao, status)
SELECT usuarios.id, unidades.id, categorias_ocorrencias.id,
       dados.titulo, dados.descricao, dados.status
FROM (VALUES
    ('morador1@sindicodigital.test', 'demo-ipe', 'A', '101', 'Elétrica',
     'Lâmpada queimada no corredor', 'A lâmpada do corredor do bloco A não acende.', 'ABERTA'),
    ('morador2@sindicodigital.test', 'demo-ipe', 'A', '101', 'Barulho',
     'Som alto após as 22h', 'Unidade vizinha com música alta de madrugada.', 'EM_ANDAMENTO'),
    ('morador1@sindicodigital.test', 'demo-ipe', 'A', '102', 'Limpeza',
     'Lixo na garagem', 'Sacos acumulados na vaga 12.', 'CONCLUIDA'),
    ('morador3@sindicodigital.test', 'demo-carvalho', 'C', '301', 'Segurança',
     'Portão da garagem aberto', 'O portão social não fecha sozinho.', 'ABERTA'),
    ('morador3@sindicodigital.test', 'demo-carvalho', 'C', '301', 'Elétrica',
     'Interfone mudo', 'O interfone da 301 não chama a portaria.', 'EM_ANDAMENTO')
) AS dados (email, codigo, bloco, numero, categoria, titulo, descricao, status)
JOIN usuarios ON usuarios.email = dados.email
JOIN condominios ON condominios.codigo = dados.codigo
JOIN unidades ON unidades.condominio_id = condominios.id
    AND unidades.bloco = dados.bloco
    AND unidades.numero = dados.numero
JOIN categorias_ocorrencias ON categorias_ocorrencias.nome = dados.categoria
WHERE NOT EXISTS (
    SELECT 1 FROM ocorrencias WHERE ocorrencias.titulo = dados.titulo
);

INSERT INTO tokens_revogados (jti, expira_em)
VALUES
    ('demo-revogado-logout-1', now() - interval '2 days'),
    ('demo-revogado-logout-2', now() - interval '1 day')
ON CONFLICT (jti) DO NOTHING;
