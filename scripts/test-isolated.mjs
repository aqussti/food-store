import {Pool} from 'pg';
import {randomUUID} from 'node:crypto';
import {readFile} from 'node:fs/promises';
import {spawn} from 'node:child_process';
const schema='qa_'+randomUUID().replaceAll('-','');
const pool=new Pool({connectionString:process.env.DATABASE_URL});
const db=await pool.connect();
try {
  await db.query(`CREATE SCHEMA "${schema}"`);
  await db.query(`SET search_path TO "${schema}"`);
  for(const file of ['db/auth/001-auth.sql','db/migrations/001_admin_foundation.sql','db/migrations/002_customer_checkout.sql']) {
    const sql=(await readFile(file,'utf8')).replaceAll('public.',schema+'.');
    await db.query(sql);
  }
  const url=new URL(process.env.DATABASE_URL);url.searchParams.set('options',`-c search_path=${schema}`);
  process.exitCode=await new Promise(resolve=>{
    const child=spawn(process.execPath,['node_modules/vitest/vitest.mjs','run'],{stdio:'inherit',env:{...process.env,TEST_DATABASE_URL:url.toString()}});
    child.on('exit',code=>resolve(code??1)); child.on('error',()=>resolve(1));
  });
}finally{
  // Identificador aleatorio creado por esta ejecución; nunca public ni tablas reales.
  if(!/^qa_[a-f0-9]{32}$/.test(schema))throw new Error('Esquema de prueba inválido');
  await db.query('SET search_path TO public');
  await db.query(`DROP SCHEMA "${schema}" CASCADE`);
  db.release();await pool.end();
}
