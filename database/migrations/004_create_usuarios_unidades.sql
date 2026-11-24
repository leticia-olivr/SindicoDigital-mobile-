CREATE TABLE usuarios_unidades (
    usuario_id bigint NOT NULL REFERENCES usuarios (id),
    unidade_id bigint NOT NULL REFERENCES unidades (id),
    PRIMARY KEY (usuario_id, unidade_id)
);

CREATE INDEX usuarios_unidades_unidade_id_idx
ON usuarios_unidades (unidade_id);
