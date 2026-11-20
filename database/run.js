import { readdir, readFile } from 'node:fs/promises';
import { pool } from '../src/config/database.js';
import { env } from '../src/config/env.js';

async function run(mode) {
  if (mode !== 'migrations' && mode !== 'seeds') {
    throw new Error('Use npm run db:migrate ou npm run db:seed.');
  }
  if (!env.databaseUrl) {
    throw new Error('Configure DATABASE_URL antes de executar o comando.');
  }
  if (mode === 'seeds' && env.nodeEnv === 'production') {
    throw new Error('O seed fictício é destinado a bancos de desenvolvimento e teste.');
  }

  const directory = new URL(`./${mode}/`, import.meta.url);
  const files = (await readdir(directory, { withFileTypes: true }))
    .filter((entry) => entry.isFile() && entry.name.endsWith('.sql'))
    .map((entry) => entry.name)
    .sort();

  const client = await pool.connect();
  const applied = [];
  try {
    await client.query('BEGIN');
    await client.query('SELECT pg_advisory_xact_lock(643241, 192845)');
    await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        filename text PRIMARY KEY,
        applied_at timestamptz NOT NULL DEFAULT now()
      )
    `);

    for (const filename of files) {
      if (mode === 'migrations') {
        const { rowCount } = await client.query(
          'INSERT INTO schema_migrations (filename) VALUES ($1) ON CONFLICT DO NOTHING',
          [filename]
        );
        if (rowCount === 0) continue;
      }

      try {
        await client.query(await readFile(new URL(filename, directory), 'utf8'));
      } catch (error) {
        throw new Error(`${filename}: ${error.message}`, { cause: error });
      }
      applied.push(filename);
    }
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }

  console.log(applied.length ? `Executados: ${applied.join(', ')}` : 'Nenhum arquivo pendente.');
}

try {
  await run(process.argv[2]);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
