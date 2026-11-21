import { pool } from '../config/database.js';

export async function revogarToken(jti, expiraEmSegundos) {
  await pool.query('DELETE FROM tokens_revogados WHERE expira_em < now()');
  await pool.query(
    `INSERT INTO tokens_revogados (jti, expira_em)
     VALUES ($1, to_timestamp($2))
     ON CONFLICT (jti) DO NOTHING`,
    [jti, expiraEmSegundos]
  );
}
