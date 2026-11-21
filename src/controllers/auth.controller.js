import bcrypt from 'bcryptjs';
import { criarUsuario } from '../services/usuarios.service.js';
import { validarCadastro } from '../validators/usuario.validator.js';

const SALT_ROUNDS = 10;

export async function signup(req, res) {
  const { nome, email, senha } = validarCadastro(req.body);
  const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);
  const usuario = await criarUsuario({ nome, email, senhaHash });

  res.status(201).json(usuario);
}
