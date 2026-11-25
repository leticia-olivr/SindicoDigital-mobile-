import { registrarOcorrencia as salvarOcorrencia, 
  listarOcorrenciasPermitida, 
  consultarOcorrenciaPorId,
  atualizarOcorrencia,
  excluirOcorrencia
} from '../services/ocorrencias.service.js';
import { HttpError } from '../utils/http-error.js';

function validarId(valor, campo) {
  if (!/^[1-9]\d*$/.test(String(valor ?? ''))) {
    throw new HttpError(400, `O ${campo} deve ser um número inteiro positivo.`);
  }
}

export async function registrarOcorrencia(req, res) {
  const { unidade_id, categoria_id, titulo, descricao } = req.body;

  validarId(unidade_id, 'id da unidade');
  validarId(categoria_id, 'id da categoria');

  if (typeof titulo !== 'string' || !titulo.trim()) {
    throw new HttpError(400, 'O título da ocorrência é obrigatório.');
  }

  if (typeof descricao !== 'string' || !descricao.trim()) {
    throw new HttpError(400, 'A descrição da ocorrência é obrigatória.');
  }

  const ocorrencia = await salvarOcorrencia(
    req.usuario.id,
    unidade_id,
    categoria_id,
    titulo.trim(),
    descricao.trim(),
    req.usuario
  );

  res.status(201).json({
    message: 'Ocorrência registrada com sucesso.',
    ocorrencia
  });
}

export async function listarOcorrencias(req, res) {
  const ocorrencias = await listarOcorrenciasPermitidas(req.usuario);

  return res.status(200).json({
    total: ocorrencias.length,
    ocorrencias
  });
}

export async function consultarOcorrencia(req, res) {
  const ocorrenciaId = validarId(req.params.id, 'ID da ocorrência');

  const ocorrencia = await consultarOcorrenciaPorId(
    ocorrenciaId,
    req.usuario
  );

  return res.status(200).json({ ocorrencia });
}

export async function atualizarOcorrenciaController(req, res) {
  const ocorrenciaId = validarId(req.params.id, 'ID da ocorrência');

  const { titulo, descricao, status } = req.body;

  if (
    titulo === undefined &&
    descricao === undefined &&
    status === undefined
  ) {
    throw new HttpError(400, 'Informe ao menos um campo para atualizar.');
  }

  if (titulo !== undefined && (typeof titulo !== 'string' || !titulo.trim())) {
    throw new HttpError(400, 'O título não pode ser vazio.');
  }

  if (descricao !== undefined && (typeof descricao !== 'string' || !descricao.trim())) {
    throw new HttpError(400, 'A descrição não pode ser vazia.');
  }

  const ocorrencia = await atualizarOcorrencia(
    ocorrenciaId,
    { titulo, descricao, status },
    req.usuario
  );

  return res.status(200).json({
    message: 'Ocorrência atualizada com sucesso.',
    ocorrencia
  });
}

export async function excluirOcorrenciaController(req, res) {
  const ocorrenciaId = validarId(req.params.id, 'ID da ocorrência');

  const ocorrencia = await excluirOcorrencia(
    ocorrenciaId,
    req.usuario
  );

  return res.status(200).json({
    message: 'Ocorrência excluída com sucesso.',
    ocorrencia
  });
}