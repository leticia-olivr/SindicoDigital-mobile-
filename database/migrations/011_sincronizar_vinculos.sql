-- Sincroniza vínculos que existem em apenas uma das tabelas equivalentes.

-- Morador e unidade: moradores_unidades -> usuarios_unidades.
INSERT INTO usuarios_unidades (usuario_id, unidade_id, tipo_usuario)
SELECT m.usuario_id, mu.unidade_id, 'MORADOR'
FROM moradores_unidades mu
JOIN moradores m ON m.id = mu.morador_id
JOIN usuarios u ON u.id = m.usuario_id AND u.tipo = 'MORADOR'
ON CONFLICT DO NOTHING;

-- Morador e unidade: usuarios_unidades -> moradores + moradores_unidades.
-- Reaproveita cadastro antigo com o mesmo e-mail e sem usuário.
UPDATE moradores m
SET usuario_id = u.id
FROM usuarios u
WHERE m.usuario_id IS NULL
  AND m.email = u.email
  AND u.tipo = 'MORADOR'
  AND EXISTS (SELECT 1 FROM usuarios_unidades uu WHERE uu.usuario_id = u.id)
  AND NOT EXISTS (SELECT 1 FROM moradores x WHERE x.usuario_id = u.id);

INSERT INTO moradores (nome, email, usuario_id)
SELECT u.nome, u.email, u.id
FROM usuarios u
WHERE u.tipo = 'MORADOR'
  AND EXISTS (SELECT 1 FROM usuarios_unidades uu WHERE uu.usuario_id = u.id)
  AND NOT EXISTS (SELECT 1 FROM moradores m WHERE m.usuario_id = u.id)
  AND NOT EXISTS (SELECT 1 FROM moradores m WHERE m.email = u.email);

INSERT INTO moradores_unidades (morador_id, unidade_id)
SELECT m.id, uu.unidade_id
FROM usuarios_unidades uu
JOIN moradores m ON m.usuario_id = uu.usuario_id
ON CONFLICT DO NOTHING;

-- Síndico e condomínio: sindicos_condominios <-> usuarios_condominios.
INSERT INTO usuarios_condominios (usuario_id, condominio_id)
SELECT sindico_id, condominio_id
FROM sindicos_condominios
ON CONFLICT DO NOTHING;

INSERT INTO sindicos_condominios (sindico_id, condominio_id)
SELECT uc.usuario_id, uc.condominio_id
FROM usuarios_condominios uc
JOIN usuarios u ON u.id = uc.usuario_id AND u.tipo = 'SINDICO'
ON CONFLICT DO NOTHING;
