import { pool } from '../config/database.js';
import { HttpError } from '../utils/http-error.js';

export async function criarOcorrencia(dados, ator) {
  const usuarioId = ator.tipo === 'MORADOR'
    ? ator.id
    : dados.usuario_id;

  const vinculo = await pool.query(
    `SELECT 1
     FROM usuarios_unidades
     WHERE usuario_id = $1 AND unidade_id = $2`,
    [usuarioId, dados.unidade_id]
  );

  if (vinculo.rowCount === 0) {
    throw new HttpError(
      400,
      'O morador informado não está associado a esta unidade.'
    );
  }

  if (ator.tipo === 'SINDICO') {
    const acesso = await pool.query(
      `SELECT 1
       FROM unidades un
       JOIN sindicos_condominios sc
         ON sc.condominio_id = un.condominio_id
       WHERE un.id = $1 AND sc.sindico_id = $2`,
      [dados.unidade_id, ator.id]
    );

    if (acesso.rowCount === 0) {
      throw new HttpError(403, 'Você não administra o condomínio desta unidade.');
    }
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO ocorrencias
        (titulo, descricao, usuario_id, unidade_id, categoria_id)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, titulo, descricao, usuario_id,
                 unidade_id, categoria_id, criado_em`,
      [
        dados.titulo,
        dados.descricao,
        usuarioId,
        dados.unidade_id,
        dados.categoria_id
      ]
    );

    return rows[0];
  } catch (error) {
    if (error.code === '23503') {
      throw new HttpError(400, 'Unidade, morador ou categoria inválidos.');
    }
    throw error;
  }
}

export async function listarOcorrencias(filtros = {}, ator) {
  const conditions = [];
  const values = [];

  if (ator.tipo === 'MORADOR') {
    values.push(ator.id);
    conditions.push(`o.usuario_id = $${values.length}`);
  }

  if (ator.tipo === 'SINDICO') {
    values.push(ator.id);
    conditions.push(`
      EXISTS (
        SELECT 1
        FROM unidades un2
        JOIN sindicos_condominios sc
          ON sc.condominio_id = un2.condominio_id
        WHERE un2.id = o.unidade_id
          AND sc.sindico_id = $${values.length}
      )
    `);
  }

  for (const campo of ['id', 'usuario_id', 'unidade_id', 'categoria_id']) {
    if (filtros[campo]) {
      values.push(filtros[campo]);
      conditions.push(`o.${campo} = $${values.length}`);
    }
  }

  const where = conditions.length
    ? `WHERE ${conditions.join(' AND ')}`
    : '';

  const { rows } = await pool.query(
    `SELECT
        o.id,
        o.titulo,
        o.descricao,
        o.usuario_id,
        u.nome AS morador,
        o.unidade_id,
        un.bloco,
        un.numero AS apartamento,
        un.condominio_id,
        c.id AS categoria_id,
        c.nome AS categoria,
        o.criado_em
     FROM ocorrencias o
     JOIN usuarios u ON u.id = o.usuario_id
     JOIN unidades un ON un.id = o.unidade_id
     JOIN categorias_ocorrencias c ON c.id = o.categoria_id
     ${where}
     ORDER BY o.criado_em DESC`,
    values
  );

  return rows;
}

export async function buscarOcorrenciaPorId(id, ator) {
  const ocorrencias = await listarOcorrencias({ id }, ator);
  const ocorrencia = ocorrencias[0];

  if (!ocorrencia) {
    throw new HttpError(404, 'Ocorrência não encontrada.');
  }

  return ocorrencia;
}