import { criarCategoria as salvarCategoria, buscarCategoriaPorId, atualizarCategoria as salvarAtualizacao, excluirCategoria as removerCategoria } from '../services/categorias.service.js';
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

export async function consultarCategoriaPorId(req, res) {
  const { id } = req.params;

  if (!/^\d+$/.test(id) || Number(id) <= 0) {
    throw new HttpError(400, 'O ID da categoria deve ser um número inteiro positivo.');
  }

  const categoria = await buscarCategoriaPorId(id);

  res.status(200).json(categoria);
}

export async function atualizarCategoria(req, res) {
  const { id } = req.params;
  const { nome, descricao } = req.body;

  if (!/^\d+$/.test(id) || Number(id) <= 0) {
    throw new HttpError(400, 'O ID deve ser um número inteiro positivo.');
  }

  if (typeof nome !== 'string' || !nome.trim()) {
    throw new HttpError(400, 'O nome da categoria é obrigatório.');
  }

  if (descricao !== undefined && descricao !== null && typeof descricao !== 'string') {
    throw new HttpError(400, 'A descrição deve ser um texto.');
  }

  const categoria = await salvarAtualizacao(
    id,
    nome.trim(),
    descricao?.trim() ?? null
  );

  res.status(200).json({
    message: 'Categoria atualizada com sucesso.',
    categoria
  });
}

export async function excluirCategoria(req, res) {
  const { id } = req.params;

  if (!/^\d+$/.test(id) || Number(id) <= 0) {
    throw new HttpError(400, 'O ID deve ser um número inteiro positivo.');
  }

  await removerCategoria(id);

  res.status(200).json({
    message: 'Categoria excluída com sucesso.'
  });
}
