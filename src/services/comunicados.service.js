import { pool } from '../config/database.js';

const SELECT_COMUNICADO = `
  SELECT c.id, c.titulo, c.conteudo, c.autor_id,
         u.nome AS autor_nome, c.criado_em, c.atualizado_em
  FROM comunicados c
  JOIN usuarios u ON u.id = c.autor_id`;

export async function listarComunicados() {
  const { rows } = await pool.query(
    `${SELECT_COMUNICADO} ORDER BY c.criado_em DESC, c.id DESC`
  );
  return rows;
}

export async function buscarComunicadoPorId(id) {
  const { rows } = await pool.query(
    `${SELECT_COMUNICADO} WHERE c.id = $1`,
    [id]
  );
  return rows[0];
}

export async function criarComunicado({ titulo, conteudo, autorId }) {
  const { rows } = await pool.query(
    `INSERT INTO comunicados (titulo, conteudo, autor_id)
     VALUES ($1, $2, $3)
     RETURNING id`,
    [titulo, conteudo, autorId]
  );
  return buscarComunicadoPorId(rows[0].id);
}

const COLUNAS_EDITAVEIS = {
  titulo: 'titulo',
  conteudo: 'conteudo'
};

export async function atualizarComunicado(id, campos) {
  const sets = [];
  const valores = [];
  for (const [campo, coluna] of Object.entries(COLUNAS_EDITAVEIS)) {
    if (campos[campo] !== undefined) {
      valores.push(campos[campo]);
      sets.push(`${coluna} = $${valores.length}`);
    }
  }
  sets.push('atualizado_em = now()');
  valores.push(id);

  const { rowCount } = await pool.query(
    `UPDATE comunicados SET ${sets.join(', ')}
     WHERE id = $${valores.length}`,
    valores
  );
  if (rowCount === 0) return undefined;
  return buscarComunicadoPorId(id);
}

export async function excluirComunicado(id) {
  const { rowCount } = await pool.query(
    'DELETE FROM comunicados WHERE id = $1',
    [id]
  );
  return rowCount > 0;
}