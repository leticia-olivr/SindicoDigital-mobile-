
-- Vincula a conta morador1 ao cadastro de Ana.
UPDATE moradores
SET usuario_id = (
    SELECT id FROM usuarios
    WHERE email = 'morador1@sindicodigital.test'
      AND tipo = 'MORADOR'
)
WHERE email = 'ana@example.invalid'
  AND usuario_id IS NULL
  AND EXISTS (
      SELECT 1 FROM usuarios
      WHERE email = 'morador1@sindicodigital.test'
        AND tipo = 'MORADOR'
  );

-- Vincula a conta morador2 ao cadastro de Bruno.
UPDATE moradores
SET usuario_id = (
    SELECT id FROM usuarios
    WHERE email = 'morador2@sindicodigital.test'
      AND tipo = 'MORADOR'
)
WHERE email = 'bruno@example.invalid'
  AND usuario_id IS NULL
  AND EXISTS (
      SELECT 1 FROM usuarios
      WHERE email = 'morador2@sindicodigital.test'
        AND tipo = 'MORADOR'
  );

-- Associa a síndica de demonstração ao Residencial Ipê.
INSERT INTO usuarios_condominios (usuario_id, condominio_id)
SELECT usuarios.id, condominios.id
FROM usuarios
CROSS JOIN condominios
WHERE usuarios.email = 'sindica@sindicodigital.test'
  AND usuarios.tipo = 'SINDICO'
  AND condominios.codigo = 'demo-ipe'
ON CONFLICT (usuario_id, condominio_id) DO NOTHING;
