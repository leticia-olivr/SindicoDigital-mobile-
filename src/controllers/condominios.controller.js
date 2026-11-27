import { listarCondominios } from '../services/condominios.service.js';

export async function listar(req, res) {
  const condominios = await listarCondominios();

  res.status(200).json(condominios);
}
