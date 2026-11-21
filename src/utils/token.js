import { randomUUID } from 'node:crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

function segredo() {
  if (!env.jwtSecret) {
    throw new Error('Configure JWT_SECRET no arquivo .env.');
  }
  return env.jwtSecret;
}

export function gerarToken(usuario) {
  return jwt.sign({}, segredo(), {
    subject: String(usuario.id),
    jwtid: randomUUID(),
    expiresIn: env.jwtExpiresIn,
    algorithm: 'HS256'
  });
}

export function verificarToken(token) {
  return jwt.verify(token, segredo(), { algorithms: ['HS256'] });
}
