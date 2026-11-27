
import { pool } from '../config/database.js';
import { HttpError } from '../utils/http-error.js';

const CAMPOS_PUBLICOS = 'id, nome, email, tipo, criado_em';

function tratarErroDoBanco(error) {
  if (error.code === '23505') {
    throw new HttpError(409, 'Este e-mail já está cadastrado.');
  }

  if (error.code === '23503') {
    throw new HttpError(
      409,
      'Este usuário possui registros vinculados e não pode ser excluído.'
    );
  }

  throw error;
}

export async function criarUsuario({
  nome,
  email,
  senhaHash,
  tipo = 'MORADOR'
}) {
  try {
    const { rows } = await pool.query(
      `INSERT INTO usuarios (nome, email, senha_hash, tipo)
       VALUES ($1, $2, $3, $4)
       RETURNING ${CAMPOS_PUBLICOS}`,
      [nome, email, senhaHash, tipo]
    );

    return rows[0];
  } catch (error) {
    tratarErroDoBanco(error);
  }
}

export async function criarMoradorComUnidade({
  nome,
  email,
  senhaHash,
  unidadeId
}) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // 1. Cria o usuário.
    const { rows: usuarios } = await client.query(
      `INSERT INTO usuarios (nome, email, senha_hash, tipo)
       VALUES ($1, $2, $3, 'MORADOR')
       RETURNING ${CAMPOS_PUBLICOS}`,
      [nome, email, senhaHash]
    );

    const usuario = usuarios[0];

    // 2. Cria o cadastro do morador.
    const { rows: moradores } = await client.query(
      `INSERT INTO moradores (nome, email, usuario_id)
       VALUES ($1, $2, $3)
       RETURNING id`,
      [nome, email, usuario.id]
    );

    const moradorId = moradores[0].id;

    // 3. Associa o morador à unidade.
    await client.query(
      `INSERT INTO moradores_unidades (morador_id, unidade_id)
       VALUES ($1, $2)`,
      [moradorId, unidadeId]
    );

    // 4. Registra o mesmo vínculo na tabela lida por ocorrências e unidades.
    await client.query(
      `INSERT INTO usuarios_unidades (usuario_id, unidade_id, tipo_usuario)
       VALUES ($1, $2, 'MORADOR')`,
      [usuario.id, unidadeId]
    );

    await client.query('COMMIT');

    return usuario;
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // Mantém o erro original caso o rollback também falhe.
    }

    if (error.code === '23505') {
      throw new HttpError(409, 'Este e-mail já está cadastrado.');
    }

    if (error.code === '23503') {
      throw new HttpError(404, 'Unidade não encontrada.');
    }

    throw error;
  } finally {
    client.release();
  }
}

export async function listarUsuarios() {
  const { rows } = await pool.query(
    `SELECT ${CAMPOS_PUBLICOS}
     FROM usuarios
     ORDER BY id`
  );

  return rows;
}

export async function buscarPorId(id) {
  const { rows } = await pool.query(
    `SELECT ${CAMPOS_PUBLICOS}
     FROM usuarios
     WHERE id = $1`,
    [id]
  );

  return rows[0];
}

// O tipo não pode ser alterado pelo endpoint genérico.
const COLUNAS_EDITAVEIS = {
  nome: 'nome',
  email: 'email',
  senhaHash: 'senha_hash'
};

export async function atualizarUsuario(id, campos) {
  const sets = [];
  const valores = [];

  for (const [campo, coluna] of Object.entries(COLUNAS_EDITAVEIS)) {
    if (campos[campo] !== undefined) {
      valores.push(campos[campo]);
      sets.push(`${coluna} = $${valores.length}`);
    }
  }

  if (sets.length === 0) {
    throw new HttpError(
      400,
      'Nenhum campo válido foi informado para atualização.'
    );
  }

  valores.push(id);

  try {
    const { rows } = await pool.query(
      `UPDATE usuarios
       SET ${sets.join(', ')}
       WHERE id = $${valores.length}
       RETURNING ${CAMPOS_PUBLICOS}`,
      valores
    );

    return rows[0];
  } catch (error) {
    tratarErroDoBanco(error);
  }
}

export async function excluirUsuario(id) {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM usuarios WHERE id = $1',
      [id]
    );

    return rowCount > 0;
  } catch (error) {
    tratarErroDoBanco(error);
  }
}

export async function buscarPorTokenValido(id, jti) {
  const { rows } = await pool.query(
    `SELECT ${CAMPOS_PUBLICOS}
     FROM usuarios
     WHERE id = $1
       AND NOT EXISTS (
         SELECT 1
         FROM tokens_revogados
         WHERE jti = $2
       )`,
    [id, jti]
  );

  return rows[0];
}

export async function buscarParaLogin(email) {
  const { rows } = await pool.query(
    `SELECT ${CAMPOS_PUBLICOS}, senha_hash
     FROM usuarios
     WHERE email = $1`,
    [email]
  );

  return rows[0];
}

export async function listarUsuariosVisiveis(usuario) {
  if (usuario.tipo === 'ADMIN') {
    return listarUsuarios();
  }

  if (usuario.tipo !== 'SINDICO') {
    return [];
  }

  const { rows } = await pool.query(
    `SELECT DISTINCT
            usuarios.id,
            usuarios.nome,
            usuarios.email,
            usuarios.tipo,
            usuarios.criado_em
     FROM usuarios
     INNER JOIN moradores
       ON moradores.usuario_id = usuarios.id
     INNER JOIN moradores_unidades
       ON moradores_unidades.morador_id = moradores.id
     INNER JOIN unidades
       ON unidades.id = moradores_unidades.unidade_id
     INNER JOIN usuarios_condominios
       ON usuarios_condominios.condominio_id = unidades.condominio_id
     WHERE usuarios_condominios.usuario_id = $1
       AND usuarios.tipo = 'MORADOR'
     ORDER BY usuarios.id`,
    [usuario.id]
  );

  return rows;
}

export async function usuarioPertenceAoCondominioDoSindico(
  usuarioId,
  sindicoId
) {
  const { rowCount } = await pool.query(
    `SELECT 1
     FROM moradores
     INNER JOIN moradores_unidades
       ON moradores_unidades.morador_id = moradores.id
     INNER JOIN unidades
       ON unidades.id = moradores_unidades.unidade_id
     INNER JOIN usuarios_condominios
       ON usuarios_condominios.condominio_id = unidades.condominio_id
     WHERE moradores.usuario_id = $1
       AND usuarios_condominios.usuario_id = $2
     LIMIT 1`,
    [usuarioId, sindicoId]
  );

  return rowCount > 0;
}

export async function unidadePertenceAoCondominioDoSindico(
  unidadeId,
  sindicoId
) {
  const { rowCount } = await pool.query(
    `SELECT 1
     FROM unidades
     INNER JOIN usuarios_condominios
       ON usuarios_condominios.condominio_id = unidades.condominio_id
     WHERE unidades.id = $1
       AND usuarios_condominios.usuario_id = $2
     LIMIT 1`,
    [unidadeId, sindicoId]
  );

  return rowCount > 0;
}
