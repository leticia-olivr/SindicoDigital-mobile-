import { pool } from '../config/database.js';

export async function listarCondominios() {
  const { rows } = await pool.query(
    'SELECT id, codigo, nome FROM condominios ORDER BY nome'
  );

  return rows;
}
