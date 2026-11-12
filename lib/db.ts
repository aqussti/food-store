import "server-only";

import { attachDatabasePool } from "@vercel/functions";
import { Pool } from "pg";

const globalForDb = globalThis as unknown as {
  foodStorePool?: Pool;
};

function createPool(): Pool {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error(
      "DATABASE_URL no está configurada. Copiá .env.example a .env.local y completá la cadena de conexión de Neon.",
    );
  }

  const pool = new Pool({
    connectionString,
    application_name: "food-store",
    max: 5,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 10_000,
  });

  attachDatabasePool(pool);

  return pool;
}

/**
 * Devuelve el pool reutilizable de PostgreSQL. Solo puede importarse desde
 * código de servidor. Para una transacción, usar `getDb().connect()` y
 * liberar el cliente con `client.release()`.
 */
export function getDb(): Pool {
  globalForDb.foodStorePool ??= createPool();

  return globalForDb.foodStorePool;
}

/** Consulta mínima para comprobar que la conexión configurada responde. */
export async function checkDatabaseConnection(): Promise<void> {
  const result = await getDb().query("SELECT 1 AS ok");

  if (result.rows[0]?.ok !== 1) {
    throw new Error("La consulta de verificación no devolvió el valor esperado.");
  }
}
