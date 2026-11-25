CREATE TABLE comunicados (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    titulo text NOT NULL,
    conteudo text NOT NULL,
    autor_id bigint NOT NULL REFERENCES usuarios (id),
    criado_em timestamptz NOT NULL DEFAULT now(),
    atualizado_em timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX comunicados_criado_em_idx ON comunicados (criado_em DESC);