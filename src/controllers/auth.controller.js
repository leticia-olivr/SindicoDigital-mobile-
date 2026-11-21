import bcrypt from 'bcryptjs';
import { buscarParaLogin, criarUsuario } from '../services/usuarios.service.js';
import { HttpError } from '../utils/http-error.js';
import { gerarToken } from '../utils/token.js';
import { validarCadastro } from '../validators/usuario.validator.js';

const SALT_ROUNDS = 10;
const HASH_FALSO = bcrypt.hashSync('senha-inexistente', SALT_ROUNDS);

export async function signup(req, res) {
  const { nome, email, senha } = validarCadastro(req.body);
  const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);
  const usuario = await criarUsuario({ nome, email, senhaHash });

  res.status(201).json(usuario);
}

export async function login(req, res) {
  const { email, senha } = req.body ?? {};
  if (typeof email !== 'string' || typeof senha !== 'string') {
    throw new HttpError(400, 'Informe e-mail e senha.');
  }

  const usuario = await buscarParaLogin(email.trim().toLowerCase());
  const senhaConfere = await bcrypt.compare(senha, usuario?.senha_hash ?? HASH_FALSO);

  if (!usuario || !senhaConfere) {
    throw new HttpError(401, 'E-mail ou senha inválidos.');
  }

  const { senha_hash, ...dadosPublicos } = usuario;
  res.status(200).json({ token: gerarToken(usuario), usuario: dadosPublicos });
}
