CREATE TABLE ocorrencias (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id bigint NOT NULL REFERENCES usuarios (id),
    unidade_id bigint NOT NULL REFERENCES unidades (id),
    categoria_id bigint NOT NULL REFERENCES categorias_ocorrencias (id),
    titulo text NOT NULL,
    descricao text NOT NULL,
    status text NOT NULL DEFAULT 'ABERTA'
        CHECK (status IN ('ABERTA', 'EM_ANDAMENTO', 'CONCLUIDA')),
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX ocorrencias_unidade_id_idx ON ocorrencias (unidade_id);
CREATE INDEX ocorrencias_usuario_id_idx ON ocorrencias (usuario_id);
CREATE INDEX ocorrencias_categoria_id_idx ON ocorrencias (categoria_id);
