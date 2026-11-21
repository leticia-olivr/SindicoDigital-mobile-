CREATE TABLE usuarios (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nome text NOT NULL,
    email text NOT NULL UNIQUE,
    senha_hash text NOT NULL,
    tipo text NOT NULL DEFAULT 'MORADOR'
        CHECK (tipo IN ('MORADOR', 'SINDICO', 'ADMIN')),
    criado_em timestamptz NOT NULL DEFAULT now()
);
