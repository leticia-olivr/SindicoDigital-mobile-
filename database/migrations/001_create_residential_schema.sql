CREATE TABLE condominios (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    codigo text NOT NULL UNIQUE,
    nome text NOT NULL
);

CREATE TABLE unidades (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    condominio_id bigint NOT NULL REFERENCES condominios (id),
    bloco text NOT NULL,
    numero text NOT NULL,
    UNIQUE (condominio_id, bloco, numero)
);

CREATE TABLE moradores (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome text NOT NULL,
    email text NOT NULL UNIQUE
);

CREATE TABLE moradores_unidades (
    morador_id bigint NOT NULL REFERENCES moradores (id),
    unidade_id bigint NOT NULL REFERENCES unidades (id),
    PRIMARY KEY (morador_id, unidade_id)
);

CREATE INDEX moradores_unidades_unidade_id_idx ON moradores_unidades (unidade_id);
