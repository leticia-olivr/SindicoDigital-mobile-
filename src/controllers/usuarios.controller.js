
import bcrypt from 'bcryptjs';

import {
  atualizarUsuario,
  buscarPorId,
  criarUsuario,
  criarMoradorComUnidade,
  excluirUsuario,
  listarUsuariosVisiveis,
  usuarioPertenceAoCondominioDoSindico,
  unidadePertenceAoCondominioDoSindico
} from '../services/usuarios.service.js';

import { HttpError } from '../utils/http-error.js';

import {
  validarAtualizacao,
  validarCriacao
} from '../validators/usuario.validator.js';

const SALT_ROUNDS = 10;

function lerId(req) {
  const { id } = req.params;

  if (!/^\d+$/.test(id)) {
    throw new HttpError(
      400,
      'O id do usuário deve ser um número inteiro positivo.'
    );
  }

  return id;
}

function negar(
  mensagem = 'Você não tem permissão para realizar esta ação.'
) {
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
  const usuarios = await listarUsuariosVisiveis(req.usuario);

  res.status(200).json(usuarios);
}

export async function buscar(req, res) {
  const id = lerId(req);
  const ator = req.usuario;

  if (ator.tipo === 'MORADOR' && String(ator.id) !== id) {
    negar();
  }

  const alvo = await carregarUsuario(id);

  if (ator.tipo === 'SINDICO') {
    if (alvo.tipo !== 'MORADOR') {
      negar();
    }

    const pertence = await usuarioPertenceAoCondominioDoSindico(
      alvo.id,
      ator.id
    );

    if (!pertence) {
      negar();
    }
  }

  res.status(200).json(alvo);
}

export async function criar(req, res) {
  const {
    nome,
    email,
    senha,
    tipo,
    unidadeId
  } = validarCriacao(req.body);

  const tipoEfetivo = tipo ?? 'MORADOR';

  // Somente ADMIN pode criar SINDICO ou ADMIN.
  if (
    tipoEfetivo !== 'MORADOR' &&
    req.usuario.tipo !== 'ADMIN'
  ) {
    negar(
      'Somente administradores podem criar síndicos ou administradores.'
    );
  }

  const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);

  // Criação de MORADOR com vínculo à unidade.
  if (tipoEfetivo === 'MORADOR') {
    // SINDICO só pode cadastrar moradores em seus condomínios.
    if (req.usuario.tipo === 'SINDICO') {
      const unidadePermitida =
        await unidadePertenceAoCondominioDoSindico(
          unidadeId,
          req.usuario.id
        );

      if (!unidadePermitida) {
        negar(
          'Você só pode cadastrar moradores em unidades dos seus condomínios.'
        );
      }
    }

    const usuario = await criarMoradorComUnidade({
      nome,
      email,
      senhaHash,
      unidadeId
    });

    return res.status(201).json(usuario);
  }

  // Criação de SINDICO ou ADMIN.
  const usuario = await criarUsuario({
    nome,
    email,
    senhaHash,
    tipo: tipoEfetivo
  });

  res.status(201).json(usuario);
}

export async function atualizar(req, res) {
  const id = lerId(req);
  const ator = req.usuario;

  const { senha, ...campos } = validarAtualizacao(req.body);
  const alvo = await carregarUsuario(id);

  // MORADOR só pode atualizar os próprios dados.
  if (ator.tipo === 'MORADOR' && String(ator.id) !== id) {
    negar();
  }

  // SINDICO só pode atualizar moradores dos seus condomínios.
  if (ator.tipo === 'SINDICO') {
    if (alvo.tipo !== 'MORADOR') {
      negar();
    }

    const pertence = await usuarioPertenceAoCondominioDoSindico(
      alvo.id,
      ator.id
    );

    if (!pertence) {
      negar();
    }
  }

  // Alteração de tipo não é permitida nesta operação.
  if (campos.tipo !== undefined) {
    throw new HttpError(
      400,
      'A alteração do tipo de usuário não está disponível nesta operação.'
    );
  }

  if (senha !== undefined) {
    campos.senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);
  }

  const usuarioAtualizado = await atualizarUsuario(id, campos);

  res.status(200).json(usuarioAtualizado);
}

export async function excluir(req, res) {
  const id = lerId(req);
  const ator = req.usuario;

  if (String(ator.id) === id) {
  negar('Você não pode excluir sua própria conta.');
}

  const alvo = await carregarUsuario(id);

  if (ator.tipo === 'SINDICO') {
    if (alvo.tipo !== 'MORADOR') {
      negar();
    }

    const pertence = await usuarioPertenceAoCondominioDoSindico(
      alvo.id,
      ator.id
    );

    if (!pertence) {
      negar();
    }
  }

  if (ator.tipo !== 'ADMIN' && ator.tipo !== 'SINDICO') {
    negar();
  }

  await excluirUsuario(id);

  res.status(204).end();
}
