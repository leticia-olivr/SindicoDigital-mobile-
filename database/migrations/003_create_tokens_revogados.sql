CREATE TABLE tokens_revogados (
    jti text PRIMARY KEY,
    expira_em timestamptz NOT NULL
);

CREATE INDEX tokens_revogados_expira_em_idx ON tokens_revogados (expira_em);
