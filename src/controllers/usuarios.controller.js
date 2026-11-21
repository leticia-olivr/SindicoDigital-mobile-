import bcrypt from 'bcryptjs';
import {
  atualizarUsuario,
  buscarPorId,
  criarUsuario,
  excluirUsuario,
  listarUsuarios
} from '../services/usuarios.service.js';
import { HttpError } from '../utils/http-error.js';
import { validarAtualizacao, validarCriacao } from '../validators/usuario.validator.js';

const SALT_ROUNDS = 10;

function ehGestor(usuario) {
  return usuario.tipo === 'SINDICO' || usuario.tipo === 'ADMIN';
}

function lerId(req) {
  const { id } = req.params;
  if (!/^\d+$/.test(id)) {
    throw new HttpError(400, 'O id do usuário deve ser um número inteiro positivo.');
  }
  return id;
}

function negar(mensagem = 'Você não tem permissão para realizar esta ação.') {
  throw new HttpError(403, mensagem);
}

async function carregarUsuario(id) {
  const usuario = await buscarPorId(id);
  if (!usuario) {
    throw new HttpError(404, 'Usuário não encontrado.');
  }
  return usuario;
}

export async function listar(req, res) {
  res.status(200).json(await listarUsuarios());
}

export async function buscar(req, res) {
  const id = lerId(req);
  const ator = req.usuario;

  if (ator.id !== id && !ehGestor(ator)) negar();

  res.status(200).json(await carregarUsuario(id));
}

export async function criar(req, res) {
  const { nome, email, senha, tipo } = validarCriacao(req.body);

  if (tipo && tipo !== 'MORADOR' && req.usuario.tipo !== 'ADMIN') {
    negar('Somente administradores podem criar síndicos ou administradores.');
  }

  const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);
  const usuario = await criarUsuario({ nome, email, senhaHash, tipo });
  res.status(201).json(usuario);
}

export async function atualizar(req, res) {
  const id = lerId(req);
  const ator = req.usuario;

  if (ator.id !== id && !ehGestor(ator)) negar();

  const { senha, ...campos } = validarAtualizacao(req.body);
  const alvo = await carregarUsuario(id);

  if (ator.tipo === 'SINDICO' && alvo.tipo === 'ADMIN') {
    negar('Síndicos não podem alterar dados de administradores.');
  }
  if (campos.tipo !== undefined && ator.tipo !== 'ADMIN') {
    negar('Somente administradores podem alterar o tipo de usuário.');
  }

  if (senha !== undefined) {
    campos.senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);
  }

  res.status(200).json(await atualizarUsuario(id, campos));
}

export async function excluir(req, res) {
  const id = lerId(req);
  const alvo = await carregarUsuario(id);

  if (req.usuario.tipo === 'SINDICO' && alvo.tipo === 'ADMIN') {
    negar('Síndicos não podem excluir administradores.');
  }

  await excluirUsuario(id);
  res.status(204).end();
}
