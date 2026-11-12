/**
 * Las pruebas de integración solo se ejecutan contra una base explícitamente
 * marcada como de prueba (`TEST_DATABASE_URL`). Nunca usan DATABASE_URL de
 * producción para evitar modificar datos reales.
 */
if (process.env.TEST_DATABASE_URL) {
  process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;
}
