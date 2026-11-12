import { mkdirSync, writeFileSync } from 'node:fs';
import { Pool } from 'pg';
import { getMigrations } from 'better-auth/db/migration';
import { authOptions } from '../lib/auth-options.ts';

const allowed = new Set(['food_store_users', 'food_store_sessions', 'food_store_accounts', 'food_store_verifications', 'food_store_auth_rate_limits']);
const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 2 });
try {
  const plan = await getMigrations(authOptions(pool));
  if ([...plan.toBeCreated, ...plan.toBeAdded].some((item) => !allowed.has(item.table))) throw new Error('La migración incluye tablas fuera de los accesos de #5.');
  if (plan.unsafeChanges.length || plan.schemaProblems.length) throw new Error('El esquema requiere una revisión antes de continuar.');
  const sql = await plan.compileMigrations();
  if (!sql.trim()) { console.log('El esquema de accesos ya está actualizado.'); }
  else if (process.argv.includes('--apply')) {
    const client = await pool.connect();
    try { await client.query('BEGIN'); await client.query(sql); await client.query('COMMIT'); }
    catch (error) { await client.query('ROLLBACK'); throw error; }
    finally { client.release(); }
    console.log('Aplicada la migración de las tablas de accesos de #5.');
  } else {
    mkdirSync('db/migrations', { recursive: true });
    writeFileSync('db/migrations/001-auth.sql', sql + '\n');
    console.log('SQL generado en db/migrations/001-auth.sql; no se modificó la base.');
  }
} catch (error) { console.error(error instanceof Error ? error.message : 'No se pudo preparar el esquema.'); process.exitCode = 1; }
finally { await pool.end(); }
