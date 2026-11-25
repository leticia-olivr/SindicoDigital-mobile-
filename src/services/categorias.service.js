import { pool } from '../config/database.js';
import { HttpError } from '../utils/http-error.js';

export async function criarCategoria(nome, descricao) {
  try {
    const { rows } = await pool.query(
      `INSERT INTO categorias_ocorrencias (nome, descricao)
       VALUES ($1, $2)
       RETURNING id, nome, descricao, criado_em`,
      [nome, descricao || null]
    );

    return rows[0];
  } catch (error) {
    if (error.code === '23505') {
      throw new HttpError(409, 'Já existe uma categoria com este nome.');
    }
    throw error;
  }
}

export async function listarCategorias() {
  const { rows } = await pool.query(
    `SELECT id, nome, descricao, criado_em
     FROM categorias_ocorrencias
     ORDER BY nome`
  );

  return rows;
}
