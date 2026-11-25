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

export async function buscarCategoriaPorId(id) {
  const { rows } = await pool.query(
    `SELECT id, nome, descricao, criado_em
     FROM categorias_ocorrencias
     WHERE id = $1`,
    [id]
  );

  if (!rows[0]) {
    throw new HttpError(404, 'Categoria não encontrada.');
  }

  return rows[0];
}

export async function atualizarCategoria(id, nome, descricao) {
  try {
    const { rows } = await pool.query(
      `UPDATE categorias_ocorrencias
       SET nome = $1, descricao = $2
       WHERE id = $3
       RETURNING id, nome, descricao, criado_em`,
      [nome, descricao ?? null, id]
    );

    if (!rows[0]) {
      throw new HttpError(404, 'Categoria não encontrada.');
    }

    return rows[0];
  } catch (error) {
    if (error.code === '23505') {
      throw new HttpError(409, 'Já existe uma categoria com este nome.');
    }
    throw error;
  }
}

export async function excluirCategoria(id) {
  const { rows } = await pool.query(
    `DELETE FROM categorias_ocorrencias
     WHERE id = $1
     RETURNING id`,
    [id]
  );

  if (!rows[0]) {
    throw new HttpError(404, 'Categoria não encontrada.');
  }
}
