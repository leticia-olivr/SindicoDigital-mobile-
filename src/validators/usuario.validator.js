
import { HttpError } from '../utils/http-error.js';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const TIPOS = ['MORADOR', 'SINDICO', 'ADMIN'];

function validarNome(nome, erros) {
  const nomeLimpo = typeof nome === 'string' ? nome.trim() : '';

  if (nomeLimpo.length < 2 || nomeLimpo.length > 100) {
    erros.push('O nome deve ter entre 2 e 100 caracteres.');
  }

  return nomeLimpo;
}

function validarEmail(email, erros) {
  const emailLimpo =
    typeof email === 'string' ? email.trim().toLowerCase() : '';

  if (!EMAIL_REGEX.test(emailLimpo) || emailLimpo.length > 254) {
    erros.push('Informe um e-mail válido.');
  }

  return emailLimpo;
}

function validarSenha(senha, erros) {
  if (typeof senha !== 'string' || senha.length < 6) {
    erros.push('A senha deve ter pelo menos 6 caracteres.');
  } else if (Buffer.byteLength(senha) > 72) {
    erros.push('A senha deve ter no máximo 72 bytes.');
  }

  return senha;
}

function validarTipo(tipo, erros) {
  if (!TIPOS.includes(tipo)) {
    erros.push(`O tipo deve ser ${TIPOS.join(', ')}.`);
  }

  return tipo;
}

function lancarSeHouverErros(erros) {
  if (erros.length > 0) {
    throw new HttpError(400, erros.join(' '));
  }
}

export function validarCadastro(body) {
  const { nome, email, senha } = body ?? {};
  const erros = [];

  const dados = {
    nome: validarNome(nome, erros),
    email: validarEmail(email, erros),
    senha: validarSenha(senha, erros)
  };

  lancarSeHouverErros(erros);

  return dados;
}

export function validarCriacao(body) {
  const dados = validarCadastro(body);
  const { tipo, unidadeId } = body ?? {};
  const erros = [];

  if (tipo !== undefined) {
    dados.tipo = validarTipo(tipo, erros);
  }

  const tipoEfetivo = tipo ?? 'MORADOR';

  if (tipoEfetivo === 'MORADOR') {
    const idValido =
      typeof unidadeId === 'number' ||
      (
        typeof unidadeId === 'string' &&
        /^\d+$/.test(unidadeId.trim())
      );

    const id = Number(unidadeId);

    if (
      !idValido ||
      !Number.isSafeInteger(id) ||
      id <= 0
    ) {
      erros.push('Informe uma unidadeId válida para o morador.');
    } else {
      dados.unidadeId = id;
    }
  } else if (unidadeId !== undefined) {
    erros.push('O campo unidadeId só pode ser informado para moradores.');
  }

  lancarSeHouverErros(erros);

  return dados;
}

export function validarAtualizacao(body) {
  const { nome, email, senha, tipo } = body ?? {};
  const erros = [];
  const dados = {};

  if (nome !== undefined) dados.nome = validarNome(nome, erros);
  if (email !== undefined) dados.email = validarEmail(email, erros);
  if (senha !== undefined) dados.senha = validarSenha(senha, erros);
  if (tipo !== undefined) dados.tipo = validarTipo(tipo, erros);

  if (Object.keys(dados).length === 0) {
    erros.push(
      'Informe ao menos um campo: nome, email, senha ou tipo.'
    );
  }

  lancarSeHouverErros(erros);

  return dados;
}
