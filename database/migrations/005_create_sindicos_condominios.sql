-- Permite referenciar conjuntamente o ID e o tipo do usuário.
ALTER TABLE usuarios
ADD CONSTRAINT usuarios_id_tipo_unique
UNIQUE (id, tipo);

-- Relaciona síndicos aos condomínios que administram.
CREATE TABLE sindicos_condominios (
    sindico_id BIGINT NOT NULL,
    condominio_id BIGINT NOT NULL,
    tipo_usuario TEXT NOT NULL DEFAULT 'SINDICO',

    CONSTRAINT sindicos_condominios_tipo_check
        CHECK (tipo_usuario = 'SINDICO'),

    CONSTRAINT sindicos_condominios_pk
        PRIMARY KEY (sindico_id, condominio_id),

    CONSTRAINT sindicos_condominios_usuario_fk
        FOREIGN KEY (sindico_id, tipo_usuario)
        REFERENCES usuarios (id, tipo),

    CONSTRAINT sindicos_condominios_condominio_fk
        FOREIGN KEY (condominio_id)
        REFERENCES condominios (id)
);

-- Facilita consultas de síndicos por condomínio.
CREATE INDEX sindicos_condominios_condominio_id_idx
ON sindicos_condominios (condominio_id);
