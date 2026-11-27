import {
  criarCondominio,
  listarCondominios
} from '../services/condominios.service.js';
import { HttpError } from '../utils/http-error.js';

export async function listar(req, res) {
  const condominios = await listarCondominios();

  res.status(200).json(condominios);
}

export async function criar(req, res) {
  const { codigo, nome } = req.body ?? {};

  if (typeof codigo !== 'string' || !codigo.trim()) {
    throw new HttpError(400, 'O código do condomínio é obrigatório.');
  }

  if (typeof nome !== 'string' || !nome.trim()) {
    throw new HttpError(400, 'O nome do condomínio é obrigatório.');
  }

  const condominio = await criarCondominio(codigo.trim(), nome.trim());

  res.status(201).json({
    message: 'Condomínio criado com sucesso.',
    condominio
  });
}
