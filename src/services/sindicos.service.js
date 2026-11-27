import { pool } from '../config/database.js';
import { HttpError } from '../utils/http-error.js';

export async function listarCondominiosDoSindico(sindicoId) {
  const { rows } = await pool.query(
    `SELECT
       c.id,
       c.codigo,
       c.nome
     FROM sindicos_condominios sc
     JOIN condominios c ON c.id = sc.condominio_id
     WHERE sc.sindico_id = $1
     ORDER BY c.nome`,
    [sindicoId]
  );

  return rows;
}

export async function associarSindicoCondominio(sindicoId, condominioId) {
  const { rows: sindicos } = await pool.query(
    `SELECT id FROM usuarios
     WHERE id = $1 AND tipo = 'SINDICO'`,
    [sindicoId]
  );

  if (sindicos.length === 0) {
    throw new HttpError(404, 'Síndico não encontrado.');
  }

  const { rows: condominios } = await pool.query(
    'SELECT id FROM condominios WHERE id = $1',
    [condominioId]
  );

  if (condominios.length === 0) {
    throw new HttpError(404, 'Condomínio não encontrado.');
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { rows } = await client.query(
      `INSERT INTO sindicos_condominios
         (sindico_id, condominio_id)
       VALUES ($1, $2)
       RETURNING sindico_id, condominio_id`,
      [sindicoId, condominioId]
    );

    // Mantém a tabela usada na gestão de usuários em sincronia.
    await client.query(
      `INSERT INTO usuarios_condominios (usuario_id, condominio_id)
       VALUES ($1, $2)
       ON CONFLICT DO NOTHING`,
      [sindicoId, condominioId]
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
      throw new HttpError(409, 'Este síndico já está associado a este condomínio.');
    }

    throw error;
  } finally {
    client.release();
  }
}

export async function desassociarSindicoCondominio(sindicoId, condominioId) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { rowCount } = await client.query(
      `DELETE FROM sindicos_condominios
       WHERE sindico_id = $1 AND condominio_id = $2`,
      [sindicoId, condominioId]
    );

    if (rowCount === 0) {
      throw new HttpError(
        404,
        'Associação entre síndico e condomínio não encontrada.'
      );
    }

    await client.query(
      `DELETE FROM usuarios_condominios
       WHERE usuario_id = $1 AND condominio_id = $2`,
      [sindicoId, condominioId]
    );

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
