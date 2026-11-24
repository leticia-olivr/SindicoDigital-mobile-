import {
  associarSindicoCondominio,
  desassociarSindicoCondominio,
  listarCondominiosDoSindico
} from '../services/sindicos.service.js';

import { HttpError } from '../utils/http-error.js';

function lerId(valor, campo) {
  if (!/^[1-9]\d*$/.test(valor ?? '')) {
    throw new HttpError(400, `O ${campo} deve ser um número inteiro positivo.`);
  }

  return valor;
}

export async function listarMeusCondominios(req, res) {
  const condominios = await listarCondominiosDoSindico(req.usuario.id);

  res.status(200).json(condominios);
}

export async function associar(req, res) {
  const sindicoId = lerId(req.params.sindicoId, 'id do síndico');
  const condominioId = lerId(req.params.condominioId, 'id do condomínio');

  const vinculo = await associarSindicoCondominio(
    sindicoId,
    condominioId
  );

  res.status(201).json({
    message: 'Síndico associado ao condomínio com sucesso.',
    vinculo
  });
}

export async function desassociar(req, res) {
  const sindicoId = lerId(req.params.sindicoId, 'id do síndico');
  const condominioId = lerId(req.params.condominioId, 'id do condomínio');

  await desassociarSindicoCondominio(
    sindicoId,
    condominioId
  );

  res.status(204).end();
}
