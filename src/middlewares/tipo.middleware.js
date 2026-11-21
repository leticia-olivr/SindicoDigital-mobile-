import { HttpError } from '../utils/http-error.js';

export function exigirTipo(...tiposPermitidos) {
  return (req, res, next) => {
    if (!tiposPermitidos.includes(req.usuario?.tipo)) {
      throw new HttpError(403, 'Você não tem permissão para realizar esta ação.');
    }
    next();
  };
}
