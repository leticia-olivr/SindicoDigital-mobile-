import { pool } from '../config/database.js';
import { HttpError } from '../utils/http-error.js';

async function validarAcessoUnidade(unidadeId, ator) {
  const { rows } = await pool.query(
    `SELECT id, condominio_id
     FROM unidades
     WHERE id = $1`,
    [unidadeId]
  );

  const unidade = rows[0];

  if (!unidade) {
    throw new HttpError(404, 'Unidade não encontrada.');
  }

  if (ator.tipo === 'MORADOR') {
    const vinculo = await pool.query(
      `SELECT 1
       FROM usuarios_unidades
       WHERE usuario_id = $1 AND unidade_id = $2`,
      [ator.id, unidadeId]
    );

    if (vinculo.rowCount === 0) {
      throw new HttpError(403, 'Você não possui acesso a esta unidade.');
    }
  }

  if (ator.tipo === 'SINDICO') {
    const acesso = await pool.query(
      `SELECT 1
       FROM sindicos_condominios
       WHERE sindico_id = $1 AND condominio_id = $2`,
      [ator.id, unidade.condominio_id]
    );

    if (acesso.rowCount === 0) {
      throw new HttpError(403, 'Você não administra o condomínio desta unidade.');
    }
  }

  return unidade;
}

export async function registrarOcorrencia(
  usuarioId,
  unidadeId,
  categoriaId,
  titulo,
  descricao,
  ator
) {
  await validarAcessoUnidade(unidadeId, ator);

  const categoria = await pool.query(
    `SELECT id
     FROM categorias_ocorrencias
     WHERE id = $1`,
    [categoriaId]
  );

  if (categoria.rowCount === 0) {
    throw new HttpError(404, 'Categoria de ocorrência não encontrada.');
  }

  const { rows } = await pool.query(
    `INSERT INTO ocorrencias
       (usuario_id, unidade_id, categoria_id, titulo, descricao)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, usuario_id, unidade_id, categoria_id,
               titulo, descricao, status, criado_em, atualizado_em`,
    [usuarioId, unidadeId, categoriaId, titulo, descricao]
  );

  return rows[0];
}

export async function listarOcorrenciasPermitidas(ator) {
  let query;

  if (ator.tipo === 'ADMIN') {
    query = `
      SELECT
        o.*,
        c.nome AS categoria_nome,
        u.bloco,
        u.numero AS unidade_numero,
        usr.nome AS usuario_nome
      FROM ocorrencias o
      JOIN categorias_ocorrencias c ON c.id = o.categoria_id
      JOIN unidades u ON u.id = o.unidade_id
      JOIN usuarios usr ON usr.id = o.usuario_id
      ORDER BY o.criado_em DESC
    `;

    const resultado = await pool.query(query);
    return resultado.rows;
  }

  if (ator.tipo === 'MORADOR') {
    query = `
      SELECT
        o.*,
        c.nome AS categoria_nome,
        u.bloco,
        u.numero AS unidade_numero,
        usr.nome AS usuario_nome
      FROM ocorrencias o
      JOIN categorias_ocorrencias c ON c.id = o.categoria_id
      JOIN unidades u ON u.id = o.unidade_id
      JOIN usuarios usr ON usr.id = o.usuario_id
      JOIN usuarios_unidades uu ON uu.unidade_id = o.unidade_id
      WHERE uu.usuario_id = $1
      ORDER BY o.criado_em DESC
    `;

    const resultado = await pool.query(query, [ator.id]);
    return resultado.rows;
  }

  if (ator.tipo === 'SINDICO') {
    query = `
      SELECT
        o.*,
        c.nome AS categoria_nome,
        u.bloco,
        u.numero AS unidade_numero,
        usr.nome AS usuario_nome
      FROM ocorrencias o
      JOIN categorias_ocorrencias c ON c.id = o.categoria_id
      JOIN unidades u ON u.id = o.unidade_id
      JOIN usuarios usr ON usr.id = o.usuario_id
      JOIN sindicos_condominios sc ON sc.condominio_id = u.condominio_id
      WHERE sc.sindico_id = $1
      ORDER BY o.criado_em DESC
    `;

    const resultado = await pool.query(query, [ator.id]);
    return resultado.rows;
  }

  throw new HttpError(403, 'Usuário sem permissão para listar ocorrências.');
}