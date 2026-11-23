
import { HttpError } from '../utils/http-error.js';

function validarCondominioId(id, erros) {
  const valido =
    (typeof id === 'string' && /^[1-9]\d*$/.test(id)) ||
    (typeof id === 'number' && Number.isSafeInteger(id) && id > 0);

  if (!valido) {
    erros.push('O condomínio deve possuir um ID inteiro positivo.');
    return undefined;
  }

  return String(id);
}

function validarTexto(valor, campo, erros) {
  if (typeof valor !== 'string' || valor.trim().length === 0) {
    erros.push(`O campo ${campo} é obrigatório.`);
    return undefined;
  }

  return valor.trim();
}

function lancarSeHouverErros(erros) {
  if (erros.length > 0) {
    throw new HttpError(400, erros.join(' '));
  }
}

export function validarCriacao(body) {
  const {
    condominio_id,
    bloco,
    numero
  } = body ?? {};

  const erros = [];

  const dados = {
    condominio_id: validarCondominioId(condominio_id, erros),
    bloco: validarTexto(bloco, 'bloco', erros),
    numero: validarTexto(numero, 'número', erros)
  };

  lancarSeHouverErros(erros);

  return dados;
}

export function validarAtualizacao(body) {
  const {
    condominio_id,
    bloco,
    numero
  } = body ?? {};

  const erros = [];
  const dados = {};

  if (condominio_id !== undefined) {
    dados.condominio_id = validarCondominioId(condominio_id, erros);
  }

  if (bloco !== undefined) {
    dados.bloco = validarTexto(bloco, 'bloco', erros);
  }

  if (numero !== undefined) {
    dados.numero = validarTexto(numero, 'número', erros);
  }

  if (Object.keys(dados).length === 0) {
    erros.push('Informe ao menos um campo para atualizar.');
  }

  lancarSeHouverErros(erros);

  return dados;
}

export function validarMoradorId(id) {
  if (!/^[1-9]\d*$/.test(String(id))) {
    throw new HttpError(
      400,
      'O ID do morador deve ser um número inteiro positivo.'
    );
  }

  return String(id);
}
