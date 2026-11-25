
-- Relaciona usuários MORADOR aos seus respectivos cadastros de moradores.
ALTER TABLE moradores
ADD COLUMN usuario_id bigint UNIQUE
REFERENCES usuarios (id)
ON DELETE SET NULL;

-- Permite que um síndico administre vários condomínios.
CREATE TABLE usuarios_condominios (
    usuario_id bigint NOT NULL
        REFERENCES usuarios (id) ON DELETE CASCADE,

    condominio_id bigint NOT NULL
        REFERENCES condominios (id) ON DELETE CASCADE,

    PRIMARY KEY (usuario_id, condominio_id)
);

-- Facilita a consulta dos síndicos associados a cada condomínio.
CREATE INDEX usuarios_condominios_condominio_id_idx
ON usuarios_condominios (condominio_id);
