import jwt from 'jsonwebtoken';
import { buscarPorTokenValido } from '../services/usuarios.service.js';
import { HttpError } from '../utils/http-error.js';
import { verificarToken } from '../utils/token.js';

export async function autenticar(req, res, next) {
  const [esquema, token] = (req.get('Authorization') ?? '').split(' ');
  if (esquema !== 'Bearer' || !token) {
    throw new HttpError(401, 'Faça login para acessar este recurso.');
  }

  let payload;
  try {
    payload = verificarToken(token);
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new HttpError(401, 'Token inválido ou expirado. Faça login novamente.');
    }
    throw error;
  }

  if (!/^\d+$/.test(payload.sub ?? '') || !payload.jti) {
    throw new HttpError(401, 'Token inválido ou expirado. Faça login novamente.');
  }

  const usuario = await buscarPorTokenValido(payload.sub, payload.jti);
  if (!usuario) {
    throw new HttpError(401, 'Sessão encerrada. Faça login novamente.');
  }

  req.usuario = usuario;
  req.token = { jti: payload.jti, exp: payload.exp };
  next();
}
