CREATE TABLE categorias_ocorrencias (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome text NOT NULL UNIQUE,
    descricao text,
    criado_em timestamptz NOT NULL DEFAULT now()
);
