import { HttpError } from '../utils/http-error.js';

function validarTitulo(titulo, erros) {
  const tituloLimpo = typeof titulo === 'string' ? titulo.trim() : '';
  if (tituloLimpo.length < 3 || tituloLimpo.length > 150) {
    erros.push('O título deve ter entre 3 e 150 caracteres.');
  }
  return tituloLimpo;
}

function validarConteudo(conteudo, erros) {
  const conteudoLimpo = typeof conteudo === 'string' ? conteudo.trim() : '';
  if (conteudoLimpo.length < 3 || conteudoLimpo.length > 5000) {
    erros.push('O conteúdo deve ter entre 3 e 5000 caracteres.');
  }
  return conteudoLimpo;
}

function lancarSeHouverErros(erros) {
  if (erros.length > 0) {
    throw new HttpError(400, erros.join(' '));
  }
}

export function validarCriacaoComunicado(body) {
  const { titulo, conteudo } = body ?? {};
  const erros = [];
  const dados = {
    titulo: validarTitulo(titulo, erros),
    conteudo: validarConteudo(conteudo, erros)
  };
  lancarSeHouverErros(erros);
  return dados;
}

export function validarAtualizacaoComunicado(body) {
  const { titulo, conteudo } = body ?? {};
  const erros = [];
  const dados = {};

  if (titulo !== undefined) dados.titulo = validarTitulo(titulo, erros);
  if (conteudo !== undefined) dados.conteudo = validarConteudo(conteudo, erros);

  if (Object.keys(dados).length === 0) {
    erros.push('Informe ao menos um campo: titulo ou conteudo.');
  }
  lancarSeHouverErros(erros);
  return dados;
}