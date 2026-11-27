import { pool } from '../config/database.js';
import { HttpError } from '../utils/http-error.js';

export async function listarCondominios() {
  const { rows } = await pool.query(
    'SELECT id, codigo, nome FROM condominios ORDER BY nome'
  );

  return rows;
}

export async function criarCondominio(codigo, nome) {
  try {
    const { rows } = await pool.query(
      `INSERT INTO condominios (codigo, nome)
       VALUES ($1, $2)
       RETURNING id, codigo, nome`,
      [codigo, nome]
    );

    return rows[0];
  } catch (error) {
    if (error.code === '23505') {
      throw new HttpError(409, 'Já existe um condomínio com este código.');
    }

    throw error;
  }
}
