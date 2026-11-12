# Conexión reutilizable a PostgreSQL en Neon

- Fecha y hora (Argentina): 2026-11-11 23:54.
- Responsable / GitHub: Fausto, @faustorivero69-hue.
- Agente / herramienta: OpenCode, agente de Fausto en esta conversación.
- Modelo: DeepSeek V4.1 Flash Free.
- Tarea del roadmap: #3 Conectar Base de Datos externa.
- Estado: implementado y validado localmente; pendiente de verificación en Vercel.

## Pedido y alcance

Fausto pidió trabajar únicamente en la tarea compartida #3, en la rama `fausto/3-conexion-neon`: configurar una conexión reutilizable solo del lado del servidor mediante `DATABASE_URL`, agregar `.env.example` sin credenciales y verificar la conexión con una consulta simple. También pidió seguir la guía de Neon para vincular el proyecto existente `broad-cherry-19766569` (organización `org-lingering-shadow-14521520`), guardar la cadena en `.env.local` y no mostrarla ni subirla a GitHub ni a la documentación.

No se crearon tablas de negocio, datos de prueba ni funcionalidades de Agustín (#5, #7, #8, #9, #10 y #11). La única consulta ejecutada contra la base fue `SELECT 1`.

## Cambios y motivos

- Se creó la rama local `fausto/3-conexion-neon` a partir de `main` limpio.
- Se siguió la guía indicada con `neon init -y --agent opencode --org-id org-lingering-shadow-14521520 --project-id broad-cherry-19766569`. El CLI vinculó el proyecto existente `my-first-project` (`broad-cherry-19766569`), rama `production`; creó `.neon` con el contexto local, descargó las variables a `.env.local` y generó `neon.ts`.
- El CLI agregó `.neon` a `.gitignore`. `.env.local` ya estaba excluido por la regla `.env*`; se mantiene la excepción `!.env.example`.
- `.env.local` contiene `DATABASE_URL` con la cadena *pooled* de Neon y otras variables descargadas por el CLI (`DATABASE_URL_UNPOOLED`, `NEON_BRANCH`, `NEON_BRANCH_ID`, `NEON_FUNCTION_HOST_SUFFIX`). La aplicación usa únicamente `DATABASE_URL`; las demás quedan disponibles para tareas futuras. El archivo no se versiona y su contenido no se incluye en este registro.
- `.env.example` documenta la variable con un valor de ejemplo, sin credenciales reales.
- `lib/db.ts` crea un pool reutilizable de `pg` de forma perezosa y lo expone con `getDb()`. Solo puede importarse desde código de servidor por `server-only`. Usa `@vercel/functions` (`attachDatabasePool`) para liberar conexiones ociosas en Vercel, limita el pool a 5 conexiones y define timeouts. La creación perezosa permite compilar sin `DATABASE_URL`; la variable se exige recién al usar la base.
- `scripts/check-db.mjs` ejecuta `SELECT 1` con `pg` y falla con código distinto de cero si no puede conectarse. Se agregó el script `pnpm db:check`, que carga `.env.local` con `node --env-file`.
- `app/api/health/db/route.ts` expone una verificación mínima para probar la conexión local y publicada. Responde `200 {"status":"ok","database":"connected"}` o `503` sin detalles internos. Es infraestructura de verificación de #3, no una funcionalidad de la tienda.
- `README.md` documenta la configuración local, la verificación y los pasos para Vercel. Se aclaró que la página Hola mundo no necesita variables, pero la conexión a Neon sí.
- Se agregaron las dependencias `pg`, `@vercel/functions` y `server-only`; `@types/pg` como dependencia de desarrollo. `neon init` agregó `@neon/config` y `@neon/env` para `neon.ts`.
- El CLI instaló skills y configuró el servidor MCP de Neon a nivel de usuario, fuera del repositorio. Esa configuración y sus credenciales no forman parte del commit ni de este registro.

## Archivos afectados

Versionados en este commit:

- `.env.example`
- `.gitignore`
- `README.md`
- `package.json`
- `pnpm-lock.yaml`
- `lib/db.ts`
- `scripts/check-db.mjs`
- `app/api/health/db/route.ts`
- `neon.ts`
- `docs/cambios/2026-11-11-2354-fausto-opencode-3-neon.md`

No versionados:

- `.env.local`: contiene `DATABASE_URL` y las demás variables descargadas por Neon. Está excluido por `.gitignore`; no se sube ni se transcribe.
- `.neon`: contexto local del proyecto Neon (organización, proyecto y rama). Está excluido por `.gitignore`.
- Configuración de usuario de OpenCode y skills de Neon instaladas por el CLI, fuera del repositorio.

## Verificación realizada y resultados

- `neon --version`: 9.4.0. `neon login` completó la autenticación.
- `neon init ...`: vinculó el proyecto `broad-cherry-19766569` (organización `org-lingering-shadow-14521520`), rama `production`, y descargó 5 variables a `.env.local`.
- Comprobación de `.env.local` sin imprimir la cadena: `DATABASE_URL` definida, host con sufijo `-pooler`, `sslmode=require` y base definida.
- `pnpm db:check`: correcto. `SELECT 1 AS ok` devolvió `1` contra Neon.
- `pnpm build`: correcto con `.env.local`. También se repitió renombrando temporalmente `.env.local`: el build siguió siendo correcto, lo que confirma que la conexión perezosa no exige la variable en tiempo de compilación. `.env.local` se restauró.
- `pnpm start` + `GET http://127.0.0.1:3000/api/health/db`: HTTP 200 con `{"status":"ok","database":"connected"}`. El servidor local se detuvo después de la prueba.
- `git diff --check`: sin errores; solo aparecieron advertencias de Git sobre conversión de fin de línea LF/CRLF en Windows.
- `pg` 8.23.1 emitió una advertencia sobre la semántica futura de `sslmode=require`; no impidió la conexión ni el build. No se modificó la cadena entregada por Neon.
- No se crearon tablas ni se insertaron datos. No se probó todavía en Vercel: no se dispone de acceso ni de verificación de la URL publicada en esta sesión. Por eso #3 sigue sin marcar como completa.

## Pendientes y coordinación con el otro integrante

### Verificación en Vercel (Agus)

1. Obtener la cadena *pooled* del proyecto Neon `broad-cherry-19766569` desde Neon Console (Project → Connect) o por un canal seguro acordado con Fausto. No pegarla en GitHub, Issues, README ni registros.
2. En Vercel, abrir el proyecto de `aqussti/food-store` → Settings → Environment Variables y agregar `DATABASE_URL` para Production, Preview y Development. Marcarla como secreta si la interfaz lo permite.
3. Volver a desplegar producción para que la variable quede disponible en la función. El build ya no requiere la variable, pero el endpoint la necesita en tiempo de ejecución.
4. Abrir `https://<url-publicada>/api/health/db`. Debe responder HTTP 200 con `{"status":"ok","database":"connected"}`. Si responde 503, revisar los logs de la función y confirmar que `DATABASE_URL` esté cargada en el entorno correcto.
5. Recién con esa respuesta se puede marcar #3 como completa en el README y cerrar el Issue. Este registro debe actualizarse con la fecha, la URL verificada y el resultado, sin credenciales.

### Contratos para las próximas tareas

- La conexión de servidor se obtiene con `getDb()` desde `@/lib/db`. No importar `lib/db.ts` en componentes de cliente.
- Para transacciones usar `const client = await getDb().connect()` y liberar siempre con `client.release()`; no crear pools paralelos.
- `DATABASE_URL` (pooled) es para la aplicación. `DATABASE_URL_UNPOOLED` queda reservada para migraciones, `pg_dump` y tareas que necesiten sesión directa; todavía no se usa.
- Antes de crear tablas para #4, #9, #10 o #12, coordinar el esquema entre ambos. En este cambio no se creó ningún modelo ni tabla.
- `/api/health/db` es una verificación temporal de #3. Después de la validación en Vercel puede removerse o protegerse si el equipo lo decide.
- Si Agus trabaja en otra copia local, debe crear su propio `.env.local` a partir de `.env.example` y completar la cadena; el `.env.local` de Fausto no se comparte por Git. `.neon` tampoco se versiona, así que el CLI puede requerir un nuevo vínculo en esa copia.
