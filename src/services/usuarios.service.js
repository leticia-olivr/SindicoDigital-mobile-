import { pool } from '../config/database.js';
import { HttpError } from '../utils/http-error.js';

const CAMPOS_PUBLICOS = 'id, nome, email, tipo, criado_em';

function tratarErroDoBanco(error) {
  if (error.code === '23505') {
    throw new HttpError(409, 'Este e-mail já está cadastrado.');
  }
  if (error.code === '23503') {
    throw new HttpError(409, 'Este usuário possui registros vinculados e não pode ser excluído.');
  }
  throw error;
}

export async function criarUsuario({ nome, email, senhaHash, tipo = 'MORADOR' }) {
  try {
    const { rows } = await pool.query(
      `INSERT INTO usuarios (nome, email, senha_hash, tipo)
       VALUES ($1, $2, $3, $4)
       RETURNING ${CAMPOS_PUBLICOS}`,
      [nome, email, senhaHash, tipo]
    );
    return rows[0];
  } catch (error) {
    tratarErroDoBanco(error);
  }
}

export async function listarUsuarios() {
  const { rows } = await pool.query(
    `SELECT ${CAMPOS_PUBLICOS} FROM usuarios ORDER BY id`
  );
  return rows;
}

export async function buscarPorId(id) {
  const { rows } = await pool.query(
    `SELECT ${CAMPOS_PUBLICOS} FROM usuarios WHERE id = $1`,
    [id]
  );
  return rows[0];
}

const COLUNAS_EDITAVEIS = {
  nome: 'nome',
  email: 'email',
  senhaHash: 'senha_hash',
  tipo: 'tipo'
};

export async function atualizarUsuario(id, campos) {
  const sets = [];
  const valores = [];
  for (const [campo, coluna] of Object.entries(COLUNAS_EDITAVEIS)) {
    if (campos[campo] !== undefined) {
      valores.push(campos[campo]);
      sets.push(`${coluna} = $${valores.length}`);
    }
  }
  valores.push(id);

  try {
    const { rows } = await pool.query(
      `UPDATE usuarios SET ${sets.join(', ')}
       WHERE id = $${valores.length}
       RETURNING ${CAMPOS_PUBLICOS}`,
      valores
    );
    return rows[0];
  } catch (error) {
    tratarErroDoBanco(error);
  }
}

export async function excluirUsuario(id) {
  try {
    const { rowCount } = await pool.query('DELETE FROM usuarios WHERE id = $1', [id]);
    return rowCount > 0;
  } catch (error) {
    tratarErroDoBanco(error);
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
