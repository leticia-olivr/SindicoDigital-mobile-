import {
  associarMoradorUnidade,
  desassociarMoradorUnidade,
  listarMoradoresDaUnidade,
  listarUnidadesDoMorador
} from '../services/unidades.service.js';
import { HttpError } from '../utils/http-error.js';

function lerId(valor, campo) {
  if (!/^[1-9]\d*$/.test(valor ?? '')) {
    throw new HttpError(400, `O ${campo} deve ser um número inteiro positivo.`);
  }
  return valor;
}

export async function listarMoradores(req, res) {
  const unidadeId = lerId(req.params.unidadeId, 'id da unidade');
  const moradores = await listarMoradoresDaUnidade(unidadeId, req.usuario);
  res.status(200).json(moradores);
}

export async function associarMorador(req, res) {
  const unidadeId = lerId(req.params.unidadeId, 'id da unidade');
  const usuarioId = lerId(req.params.usuarioId, 'id do morador');

  const vinculo = await associarMoradorUnidade(
    unidadeId,
    usuarioId,
    req.usuario
  );

  res.status(201).json({
    message: 'Morador associado à unidade com sucesso.',
    vinculo
  });
}

export async function desassociarMorador(req, res) {
  const unidadeId = lerId(req.params.unidadeId, 'id da unidade');
  const usuarioId = lerId(req.params.usuarioId, 'id do morador');

  await desassociarMoradorUnidade(
    unidadeId,
    usuarioId,
    req.usuario
  );

  res.status(204).end();
}

export async function listarMinhasUnidades(req, res) {
  const unidades = await listarUnidadesDoMorador(req.usuario.id);
  res.status(200).json(unidades);
}
