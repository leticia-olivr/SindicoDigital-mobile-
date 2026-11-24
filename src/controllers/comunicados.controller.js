
import {
  atualizarComunicado,
  buscarComunicadoPorId,
  criarComunicado,
  excluirComunicado,
  listarComunicados,
  listarComunicadosPorUsuario
} from '../services/comunicados.service.js';

import { HttpError } from '../utils/http-error.js';

import {
  validarAtualizacaoComunicado,
  validarCriacaoComunicado
} from '../validators/comunicado.validator.js';

function lerId(req) {
  const { id } = req.params;
  if (!/^\d+$/.test(id)) {
    throw new HttpError(400, 'O id do comunicado deve ser um número inteiro positivo.');
  }
  return id;
}

export async function listar(req, res) {
  const comunicados = await listarComunicados();
  res.status(200).json(comunicados);
}

export async function listarPorUsuario(req, res) {
  const comunicados = await listarComunicadosPorUsuario(
    req.usuario.id
  );

  res.status(200).json(comunicados);
}

export async function buscar(req, res) {
  const comunicado = await buscarComunicadoPorId(lerId(req));
  if (!comunicado) {
    throw new HttpError(404, 'Comunicado não encontrado.');
  }
  res.status(200).json(comunicado);
}

export async function criar(req, res) {
  const { titulo, conteudo } = validarCriacaoComunicado(req.body);
  const comunicado = await criarComunicado({
    titulo,
    conteudo,
    autorId: req.usuario.id
  });
  res.status(201).json(comunicado);
}

export async function atualizar(req, res) {
  const id = lerId(req);
  const campos = validarAtualizacaoComunicado(req.body);
  const comunicado = await atualizarComunicado(id, campos);
  if (!comunicado) {
    throw new HttpError(404, 'Comunicado não encontrado.');
  }
  res.status(200).json(comunicado);
}

export async function excluir(req, res) {
  const excluido = await excluirComunicado(lerId(req));
  if (!excluido) {
    throw new HttpError(404, 'Comunicado não encontrado.');
  }
  res.status(204).end();
}
