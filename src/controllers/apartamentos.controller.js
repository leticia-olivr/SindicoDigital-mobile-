
import {
  atualizarApartamento,
  buscarApartamentoPorId,
  criarApartamento,
  excluirApartamento,
  listarApartamentos,
  listarMoradoresDoApartamento,
  associarMorador,
  desassociarMorador
} from '../services/apartamentos.service.js';
import { HttpError } from '../utils/http-error.js';

import {
  validarAtualizacao,
  validarCriacao,
  validarMoradorId
} from '../validators/apartamento.validator.js';

function lerId(req) {
  const { id } = req.params;

  if (!/^[1-9]\d*$/.test(id)) {
    throw new HttpError(
      400,
      'O ID do apartamento deve ser um número inteiro positivo.'
    );
  }

  return id;
}

async function carregarApartamento(id) {
  const apartamento = await buscarApartamentoPorId(id);

  if (!apartamento) {
    throw new HttpError(404, 'Apartamento não encontrado.');
  }

  return apartamento;
}

export async function listar(req, res) {
  const apartamentos = await listarApartamentos();

  res.status(200).json(apartamentos);
}

export async function buscar(req, res) {
  const id = lerId(req);

  const apartamento = await carregarApartamento(id);

  res.status(200).json(apartamento);
}

export async function criar(req, res) {
  const dados = validarCriacao(req.body);

  const apartamento = await criarApartamento(dados);

  res.status(201).json(apartamento);
}

export async function atualizar(req, res) {
  const id = lerId(req);

  const dados = validarAtualizacao(req.body);

  await carregarApartamento(id);

  const apartamento = await atualizarApartamento(id, dados);

  res.status(200).json(apartamento);
}

export async function excluir(req, res) {
  const id = lerId(req);

  await carregarApartamento(id);

  await excluirApartamento(id);

  res.status(204).end();
}


export async function listarMoradores(req, res) {
  const unidadeId = lerId(req);

  await carregarApartamento(unidadeId);

  const moradores = await listarMoradoresDoApartamento(unidadeId);

  res.status(200).json(moradores);
}

export async function adicionarMorador(req, res) {
  const unidadeId = lerId(req);
  const moradorId = validarMoradorId(req.body?.morador_id);

  await carregarApartamento(unidadeId);

  const associacao = await associarMorador(unidadeId, moradorId);

  res.status(201).json(associacao);
}

export async function removerMorador(req, res) {
  const unidadeId = lerId(req);
  const moradorId = validarMoradorId(req.params.moradorId);

  await carregarApartamento(unidadeId);

  const removido = await desassociarMorador(unidadeId, moradorId);

  if (!removido) {
    throw new HttpError(
      404,
      'Associação entre morador e apartamento não encontrada.'
    );
  }

  res.status(204).end();
}

