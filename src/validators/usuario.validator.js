import { HttpError } from '../utils/http-error.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validarCadastro(body) {
  const { nome, email, senha } = body ?? {};
  const erros = [];

  const nomeLimpo = typeof nome === 'string' ? nome.trim() : '';
  if (nomeLimpo.length < 2 || nomeLimpo.length > 100) {
    erros.push('O nome deve ter entre 2 e 100 caracteres.');
  }

  const emailLimpo = typeof email === 'string' ? email.trim().toLowerCase() : '';
  if (!EMAIL_REGEX.test(emailLimpo) || emailLimpo.length > 254) {
    erros.push('Informe um e-mail válido.');
  }

  if (typeof senha !== 'string' || senha.length < 6) {
    erros.push('A senha deve ter pelo menos 6 caracteres.');
  } else if (Buffer.byteLength(senha) > 72) {
    erros.push('A senha deve ter no máximo 72 bytes.');
  }

  if (erros.length > 0) {
    throw new HttpError(400, erros.join(' '));
  }

  return { nome: nomeLimpo, email: emailLimpo, senha };
}
