import { criarCategoria as salvarCategoria } from '../services/categorias.service.js';
import { HttpError } from '../utils/http-error.js';

export async function criarCategoria(req, res) {
  const { nome, descricao } = req.body;

  if (typeof nome !== 'string' || !nome.trim()) {
    throw new HttpError(400, 'O nome da categoria é obrigatório.');
  }

  if (descricao !== undefined && descricao !== null && typeof descricao !== 'string') {
    throw new HttpError(400, 'A descrição deve ser um texto.');
  }

  const categoria = await salvarCategoria(nome.trim(), descricao?.trim());

  res.status(201).json({
    message: 'Categoria de ocorrência criada com sucesso.',
    categoria
  });
}

import { listarCategorias as buscarCategorias } from '../services/categorias.service.js';

export async function listarCategorias(req, res) {
  const categorias = await buscarCategorias();
  res.status(200).json(categorias);
}
