
import { pool } from '../config/database.js';
import { HttpError } from '../utils/http-error.js';

const CAMPOS_PUBLICOS = 'id, condominio_id, bloco, numero';

function tratarErroDoBanco(error) {
  if (error.code === '23505') {
    throw new HttpError(
      409,
      'Já existe um apartamento com este bloco e número neste condomínio.'
    );
  }

  if (error.code === '23503') {
    throw new HttpError(
      409,
      'Este apartamento possui registros vinculados ou o condomínio informado não existe.'
    );
  }

  throw error;
}

export async function criarApartamento({
  condominio_id,
  bloco,
  numero
}) {
  try {
    const { rows } = await pool.query(
      `INSERT INTO unidades (condominio_id, bloco, numero)
       VALUES ($1, $2, $3)
       RETURNING ${CAMPOS_PUBLICOS}`,
      [condominio_id, bloco, numero]
    );

    return rows[0];
  } catch (error) {
    tratarErroDoBanco(error);
  }
}

export async function listarApartamentos() {
  const { rows } = await pool.query(
    `SELECT ${CAMPOS_PUBLICOS}
     FROM unidades
     ORDER BY condominio_id, bloco, numero`
  );

  return rows;
}

export async function buscarApartamentoPorId(id) {
  const { rows } = await pool.query(
    `SELECT ${CAMPOS_PUBLICOS}
     FROM unidades
     WHERE id = $1`,
    [id]
  );

  return rows[0];
}

const COLUNAS_EDITAVEIS = {
  condominio_id: 'condominio_id',
  bloco: 'bloco',
  numero: 'numero'
};

export async function atualizarApartamento(id, campos) {
  const sets = [];
  const valores = [];

  for (const [campo, coluna] of Object.entries(COLUNAS_EDITAVEIS)) {
    if (campos[campo] !== undefined) {
      valores.push(campos[campo]);
      sets.push(`${coluna} = $${valores.length}`);
    }
  }

  valores.push(id);

  try {
    const { rows } = await pool.query(
      `UPDATE unidades
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


export async function excluirApartamento(id) {
  try {
    const { rowCount } = await pool.query(
      'DELETE FROM unidades WHERE id = $1',
      [id]
    );

    return rowCount > 0;
  } catch (error) {
    tratarErroDoBanco(error);
  }
}

export async function listarMoradoresDoApartamento(unidadeId) {
  const { rows } = await pool.query(
    `SELECT moradores.id, moradores.nome, moradores.email
     FROM moradores
     INNER JOIN moradores_unidades
       ON moradores_unidades.morador_id = moradores.id
     WHERE moradores_unidades.unidade_id = $1
     ORDER BY moradores.nome`,
    [unidadeId]
  );

  return rows;
}

export async function associarMorador(unidadeId, moradorId) {
  try {
    const { rows } = await pool.query(
      `INSERT INTO moradores_unidades (morador_id, unidade_id)
       VALUES ($1, $2)
       RETURNING morador_id, unidade_id`,
      [moradorId, unidadeId]
    );

    return rows[0];
  } catch (error) {
    if (error.code === '23505') {
      throw new HttpError(
        409,
        'Este morador já está associado a este apartamento.'
      );
    }

    if (error.code === '23503') {
      throw new HttpError(
        404,
        'Morador ou apartamento não encontrado.'
      );
    }

    throw error;
  }
}

export async function desassociarMorador(unidadeId, moradorId) {
  const { rowCount } = await pool.query(
    `DELETE FROM moradores_unidades
     WHERE unidade_id = $1 AND morador_id = $2`,
    [unidadeId, moradorId]
  );

  return rowCount > 0;
}
