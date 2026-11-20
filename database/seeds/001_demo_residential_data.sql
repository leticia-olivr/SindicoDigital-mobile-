INSERT INTO condominios (codigo, nome)
VALUES
    ('demo-ipe', 'Residencial Ipê'),
    ('demo-jacaranda', 'Residencial Jacarandá')
ON CONFLICT (codigo) DO NOTHING;

INSERT INTO unidades (condominio_id, bloco, numero)
SELECT condominios.id, dados.bloco, dados.numero
FROM (VALUES
    ('demo-ipe', 'A', '101'),
    ('demo-ipe', 'A', '102'),
    ('demo-jacaranda', 'B', '201'),
    ('demo-jacaranda', 'B', '202')
) AS dados (codigo, bloco, numero)
JOIN condominios ON condominios.codigo = dados.codigo
ON CONFLICT (condominio_id, bloco, numero) DO NOTHING;

INSERT INTO moradores (nome, email)
VALUES
    ('Ana Exemplo', 'ana@example.invalid'),
    ('Bruno Exemplo', 'bruno@example.invalid'),
    ('Carla Exemplo', 'carla@example.invalid')
ON CONFLICT (email) DO NOTHING;

INSERT INTO moradores_unidades (morador_id, unidade_id)
SELECT moradores.id, unidades.id
FROM (VALUES
    ('ana@example.invalid', 'demo-ipe', 'A', '101'),
    ('ana@example.invalid', 'demo-ipe', 'A', '102'),
    ('bruno@example.invalid', 'demo-ipe', 'A', '101'),
    ('carla@example.invalid', 'demo-jacaranda', 'B', '201'),
    ('carla@example.invalid', 'demo-jacaranda', 'B', '202')
) AS dados (email, codigo, bloco, numero)
JOIN moradores ON moradores.email = dados.email
JOIN condominios ON condominios.codigo = dados.codigo
JOIN unidades ON unidades.condominio_id = condominios.id
    AND unidades.bloco = dados.bloco AND unidades.numero = dados.numero
ON CONFLICT (morador_id, unidade_id) DO NOTHING;
