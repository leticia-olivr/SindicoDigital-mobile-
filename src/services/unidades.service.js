import { pool } from '../config/database.js';
import { HttpError } from '../utils/http-error.js';

async function validarAcessoUnidade(unidadeId, ator) {
  const { rows } = await pool.query(
    'SELECT id, condominio_id FROM unidades WHERE id = $1',
    [unidadeId]
  );

  const unidade = rows[0];

  if (!unidade) {
    throw new HttpError(404, 'Unidade não encontrada.');
  }

  if (ator.tipo === 'SINDICO') {
    const acesso = await pool.query(
      `SELECT 1 FROM sindicos_condominios
       WHERE sindico_id = $1 AND condominio_id = $2`,
      [ator.id, unidade.condominio_id]
    );

    if (acesso.rowCount === 0) {
      throw new HttpError(403, 'Você não administra o condomínio desta unidade.');
    }
  }

  return unidade;
}

export async function associarMoradorUnidade(unidadeId, usuarioId, ator) {
  await validarAcessoUnidade(unidadeId, ator);

  const usuario = await pool.query(
    `SELECT id FROM usuarios
     WHERE id = $1 AND tipo = 'MORADOR'`,
    [usuarioId]
  );

  if (usuario.rowCount === 0) {
    throw new HttpError(404, 'Morador não encontrado.');
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO usuarios_unidades
         (usuario_id, unidade_id, tipo_usuario)
       VALUES ($1, $2, 'MORADOR')
       RETURNING usuario_id, unidade_id`,
      [usuarioId, unidadeId]
    );

    return rows[0];
  } catch (error) {
    if (error.code === '23505') {
      throw new HttpError(409, 'Este morador já está associado a esta unidade.');
    }
    throw error;
  }
}

export async function desassociarMoradorUnidade(unidadeId, usuarioId, ator) {
  await validarAcessoUnidade(unidadeId, ator);

  const { rowCount } = await pool.query(
    `DELETE FROM usuarios_unidades
     WHERE unidade_id = $1 AND usuario_id = $2`,
    [unidadeId, usuarioId]
  );

  if (rowCount === 0) {
    throw new HttpError(404, 'Associação entre morador e unidade não encontrada.');
  }
}

export async function listarMoradoresDaUnidade(unidadeId, ator) {
  await validarAcessoUnidade(unidadeId, ator);

  const { rows } = await pool.query(
    `SELECT u.id, u.nome, u.email, u.tipo
     FROM usuarios_unidades uu
     JOIN usuarios u ON u.id = uu.usuario_id
     WHERE uu.unidade_id = $1
     ORDER BY u.nome`,
    [unidadeId]
  );

  return rows;
}

export async function listarUnidadesDoMorador(usuarioId) {
  const { rows } = await pool.query(
    `SELECT
       un.id,
       un.bloco,
       un.numero,
       c.id AS condominio_id,
       c.nome AS condominio
     FROM usuarios_unidades uu
     JOIN unidades un ON un.id = uu.unidade_id
     JOIN condominios c ON c.id = un.condominio_id
     WHERE uu.usuario_id = $1
     ORDER BY c.nome, un.bloco, un.numero`,
    [usuarioId]
  );

  return rows;
}
