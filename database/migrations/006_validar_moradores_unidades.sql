ALTER TABLE usuarios_unidades
ADD COLUMN tipo_usuario TEXT NOT NULL DEFAULT 'MORADOR';

ALTER TABLE usuarios_unidades
ADD CONSTRAINT usuarios_unidades_tipo_check
CHECK (tipo_usuario = 'MORADOR');

ALTER TABLE usuarios_unidades
ADD CONSTRAINT usuarios_unidades_usuario_tipo_fk
FOREIGN KEY (usuario_id, tipo_usuario)
REFERENCES usuarios (id, tipo);