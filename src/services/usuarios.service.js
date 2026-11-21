import { pool } from '../config/database.js';
import { HttpError } from '../utils/http-error.js';

const CAMPOS_PUBLICOS = 'id, nome, email, tipo, criado_em';

export async function criarUsuario({ nome, email, senhaHash }) {
  try {
    const { rows } = await pool.query(
      `INSERT INTO usuarios (nome, email, senha_hash)
       VALUES ($1, $2, $3)
       RETURNING ${CAMPOS_PUBLICOS}`,
      [nome, email, senhaHash]
    );
    return rows[0];
  } catch (error) {
    if (error.code === '23505') {
      throw new HttpError(409, 'Este e-mail já está cadastrado.');
    }
    throw error;
  }
}

export async function buscarPorTokenValido(id, jti) {
  const { rows } = await pool.query(
    `SELECT ${CAMPOS_PUBLICOS} FROM usuarios
     WHERE id = $1
       AND NOT EXISTS (SELECT 1 FROM tokens_revogados WHERE jti = $2)`,
    [id, jti]
  );
  return rows[0];
}

export async function buscarParaLogin(email) {
  const { rows } = await pool.query(
    `SELECT ${CAMPOS_PUBLICOS}, senha_hash FROM usuarios WHERE email = $1`,
    [email]
  );
  return rows[0];
}
