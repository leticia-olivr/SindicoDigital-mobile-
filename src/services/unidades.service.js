import { pool } from '../config/database.js';
import { HttpError } from '../utils/http-error.js';

// O vínculo morador-unidade existe em duas tabelas: usuarios_unidades
// e moradores_unidades (via moradores.usuario_id). Esta consulta junta as duas,
// recebendo o id do usuário no parâmetro indicado.
export function unidadesDoUsuarioSql(parametro) {
  return `
    SELECT unidade_id
    FROM usuarios_unidades
    WHERE usuario_id = ${parametro}
    UNION
    SELECT mu.unidade_id
    FROM moradores_unidades mu
    JOIN moradores m ON m.id = mu.morador_id
    WHERE m.usuario_id = ${parametro}`;
}

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

// Retorna o id do cadastro em "moradores" do usuário, criando-o se necessário.
async function garantirCadastroMorador(client, usuario) {
  const existente = await client.query(
    'SELECT id FROM moradores WHERE usuario_id = $1',
    [usuario.id]
  );

  if (existente.rowCount > 0) {
    return existente.rows[0].id;
  }

  // Cadastro antigo com o mesmo e-mail, ainda sem usuário.
  const reaproveitado = await client.query(
    `UPDATE moradores
     SET usuario_id = $1
     WHERE email = $2 AND usuario_id IS NULL
     RETURNING id`,
    [usuario.id, usuario.email]
  );

  if (reaproveitado.rowCount > 0) {
    return reaproveitado.rows[0].id;
  }

  const { rows } = await client.query(
    `INSERT INTO moradores (nome, email, usuario_id)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [usuario.nome, usuario.email, usuario.id]
  );

  return rows[0].id;
}

export async function associarMoradorUnidade(unidadeId, usuarioId, ator) {
  await validarAcessoUnidade(unidadeId, ator);

  const { rows: usuarios } = await pool.query(
    `SELECT id, nome, email FROM usuarios
     WHERE id = $1 AND tipo = 'MORADOR'`,
    [usuarioId]
  );

  if (usuarios.length === 0) {
    throw new HttpError(404, 'Morador não encontrado.');
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const moradorId = await garantirCadastroMorador(client, usuarios[0]);

    const { rows } = await client.query(
      `INSERT INTO usuarios_unidades
         (usuario_id, unidade_id, tipo_usuario)
       VALUES ($1, $2, 'MORADOR')
       RETURNING usuario_id, unidade_id`,
      [usuarioId, unidadeId]
    );

    await client.query(
      `INSERT INTO moradores_unidades (morador_id, unidade_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [moradorId, unidadeId]
    );

    await client.query('COMMIT');

    return rows[0];
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // Mantém o erro original caso o rollback também falhe.
    }

    if (error.code === '23505') {
      throw new HttpError(409, 'Este morador já está associado a esta unidade.');
    }

    throw error;
  } finally {
    client.release();
  }
}

export async function desassociarMoradorUnidade(unidadeId, usuarioId, ator) {
  await validarAcessoUnidade(unidadeId, ator);

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { rowCount: removidosUsuarios } = await client.query(
      `DELETE FROM usuarios_unidades
       WHERE unidade_id = $1 AND usuario_id = $2`,
      [unidadeId, usuarioId]
    );

    const { rowCount: removidosMoradores } = await client.query(
      `DELETE FROM moradores_unidades
       WHERE unidade_id = $1
         AND morador_id IN (
           SELECT id FROM moradores WHERE usuario_id = $2
         )`,
      [unidadeId, usuarioId]
    );

    if (removidosUsuarios + removidosMoradores === 0) {
      throw new HttpError(
        404,
        'Associação entre morador e unidade não encontrada.'
      );
    }

    await client.query('COMMIT');
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch {
      // Mantém o erro original caso o rollback também falhe.
    }

    throw error;
  } finally {
    client.release();
  }
}

export async function listarMoradoresDaUnidade(unidadeId, ator) {
  await validarAcessoUnidade(unidadeId, ator);

  const { rows } = await pool.query(
    `SELECT u.id, u.nome, u.email, u.tipo
     FROM usuarios u
     WHERE u.id IN (
       SELECT usuario_id
       FROM usuarios_unidades
       WHERE unidade_id = $1
       UNION
       SELECT m.usuario_id
       FROM moradores_unidades mu
       JOIN moradores m ON m.id = mu.morador_id
       WHERE mu.unidade_id = $1 AND m.usuario_id IS NOT NULL
     )
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
     FROM unidades un
     JOIN condominios c ON c.id = un.condominio_id
     WHERE un.id IN (${unidadesDoUsuarioSql('$1')})
     ORDER BY c.nome, un.bloco, un.numero`,
    [usuarioId]
  );

  return rows;
}
