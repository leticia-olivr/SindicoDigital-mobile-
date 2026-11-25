CREATE TABLE ocorrencias (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    titulo text NOT NULL,
    descricao text NOT NULL,
    usuario_id bigint NOT NULL,
    unidade_id bigint NOT NULL,
    categoria_id bigint NOT NULL,
    criado_em timestamptz NOT NULL DEFAULT now(),

    CONSTRAINT ocorrencias_usuario_unidade_fk
        FOREIGN KEY (usuario_id, unidade_id)
        REFERENCES usuarios_unidades (usuario_id, unidade_id),

    CONSTRAINT ocorrencias_categoria_fk
        FOREIGN KEY (categoria_id)
        REFERENCES categorias_ocorrencias (id)
);

CREATE INDEX ocorrencias_usuario_id_idx
    ON ocorrencias (usuario_id);

CREATE INDEX ocorrencias_unidade_id_idx
    ON ocorrencias (unidade_id);

CREATE INDEX ocorrencias_categoria_id_idx
    ON ocorrencias (categoria_id);