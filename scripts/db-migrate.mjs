import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Pool } from "pg";

const connectionString =
  process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL;

if (!connectionString) {
  console.error(
    "Falta DATABASE_URL (o DATABASE_URL_UNPOOLED). Configurá .env.local antes de migrar.",
  );
  process.exit(1);
}

const migrationsDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "db",
  "migrations",
);

const pool = new Pool({
  connectionString,
  application_name: "food-store-migrations",
  max: 1,
  connectionTimeoutMillis: 10_000,
});

let client;

try {
  client = await pool.connect();
  await client.query(
    "select pg_advisory_lock(hashtext('food_store_schema_migrations'))",
  );

  await client.query(`
    create table if not exists food_store_schema_migrations (
      name text primary key,
      applied_at timestamptz not null default now()
    )
  `);

  const files = (await readdir(migrationsDir))
    .filter((file) => file.endsWith(".sql"))
    .sort();

  for (const file of files) {
    const applied = await client.query(
      "select 1 from food_store_schema_migrations where name = $1",
      [file],
    );

    if (applied.rowCount) {
      console.log(`- ${file}: ya aplicada`);
      continue;
    }

    const sql = await readFile(join(migrationsDir, file), "utf8");

    try {
      await client.query("begin");
      await client.query(sql);
      await client.query(
        "insert into food_store_schema_migrations (name) values ($1)",
        [file],
      );
      await client.query("commit");
      console.log(`- ${file}: aplicada`);
    } catch (error) {
      await client.query("rollback");
      throw new Error(`Falló la migración ${file}: ${error.message}`, {
        cause: error,
      });
    }
  }
} finally {
  if (client) {
    await client
      .query("select pg_advisory_unlock(hashtext('food_store_schema_migrations'))")
      .catch(() => {});
    client.release();
  }
  await pool.end();
}
