import { Pool } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error(
    "Falta DATABASE_URL. Copiá .env.example a .env.local y completá la cadena de conexión de Neon.",
  );
  process.exit(1);
}

const pool = new Pool({
  connectionString,
  application_name: "food-store-check",
  max: 1,
  connectionTimeoutMillis: 10_000,
});

try {
  const result = await pool.query("SELECT 1 AS ok");

  if (result.rows[0]?.ok !== 1) {
    throw new Error("La consulta de verificación no devolvió el valor esperado.");
  }

  console.log("Conexión a Neon verificada: SELECT 1 devolvió 1.");
} catch (error) {
  console.error(
    "No se pudo verificar la conexión a Neon:",
    error instanceof Error ? error.message : error,
  );
  process.exitCode = 1;
} finally {
  await pool.end();
}
