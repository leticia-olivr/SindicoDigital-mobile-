import { pool } from '../src/config/database.js';
import { env } from '../src/config/env.js';

try {
  if (!env.databaseUrl) {
    throw new Error('Configure DATABASE_URL no arquivo .env antes de executar o comando.');
  }

  const { rows } = await pool.query(
    'SELECT current_database() AS banco, version() AS versao'
  );

  console.log('Conexão com o PostgreSQL realizada com sucesso.');
  console.log(`Banco: ${rows[0].banco}`);
  console.log(`Versão: ${rows[0].versao.split(' on ')[0]}`);
} catch (error) {
  console.error(`Falha na conexão com o banco: ${error.message}`);
  process.exitCode = 1;
} finally {
  await pool.end();
}
