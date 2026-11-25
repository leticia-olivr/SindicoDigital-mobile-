import {
  criarOcorrencia as salvarOcorrencia,
  listarOcorrencias as buscarOcorrencias,
  buscarOcorrenciaPorId
} from '../services/ocorrencias.service.js';

import { HttpError } from '../utils/http-error.js';

function lerId(valor, campo) {
  if (!/^[1-9]\d*$/.test(String(valor ?? ''))) {
    throw new HttpError(400, `O campo ${campo} deve ser um ID válido.`);
  }

  return Number(valor);
}

export async function criarOcorrencia(req, res) {
  const { titulo, descricao, usuario_id, unidade_id, categoria_id } = req.body;

  if (typeof titulo !== 'string' || !titulo.trim()) {
    throw new HttpError(400, 'O título é obrigatório.');
  }

  if (typeof descricao !== 'string' || !descricao.trim()) {
    throw new HttpError(400, 'A descrição é obrigatória.');
  }

  const unidadeId = lerId(unidade_id, 'unidade_id');
  const categoriaId = lerId(categoria_id, 'categoria_id');

  let usuarioId;

  if (req.usuario.tipo === 'MORADOR') {
    usuarioId = req.usuario.id;
  } else {
    usuarioId = lerId(usuario_id, 'usuario_id');
  }

  const ocorrencia = await salvarOcorrencia(
    {
      titulo: titulo.trim(),
      descricao: descricao.trim(),
      usuario_id: usuarioId,
      unidade_id: unidadeId,
      categoria_id: categoriaId
    },
    req.usuario
  );

  res.status(201).json({
    message: 'Ocorrência criada com sucesso.',
    ocorrencia
  });
}

export async function listarOcorrencias(req, res) {
  const filtros = {};

  for (const campo of ['usuario_id', 'unidade_id', 'categoria_id']) {
    if (req.query[campo] !== undefined) {
      filtros[campo] = lerId(req.query[campo], campo);
    }
  }

  const ocorrencias = await buscarOcorrencias(filtros, req.usuario);

  res.status(200).json(ocorrencias);
}

export async function consultarOcorrencia(req, res) {
  const id = lerId(req.params.id, 'id');

  const ocorrencia = await buscarOcorrenciaPorId(id, req.usuario);

  res.status(200).json(ocorrencia);
}