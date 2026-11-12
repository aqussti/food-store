# Configuración de Vercel para el agente de Agus

- Fecha y hora (Argentina): 2026-11-12 00:09, verificación de la instalación.
- Responsable / GitHub: Agustín (Agus), @aqussti.
- Agente / herramienta: Codex, asistente de Agus.
- Modelo: no consignado.
- Tarea: configuración de herramientas de Vercel solicitada por Agus; seguimiento de #2 y #3, sin implementar funcionalidades.
- Estado: CLI autenticada; plugin instalado; autorización del acceso MCP pendiente.

## Pedido y alcance

Agus pidió seguir https://vercel.com/get-started.md para configurar Vercel. Ya existe un proyecto publicado para este repositorio. No se creó otro proyecto ni se lanzó un deploy.

## Cambios y motivos

- Se preparó pnpm para herramientas globales de usuario. El instalador configuró PNPM_HOME y agregó su carpeta bin al PATH del usuario, conservando las entradas anteriores.
- Se instaló Vercel CLI 65.14.0 globalmente mediante pnpm, ya que npm/npx no estaban disponibles en este entorno.
- Se instaló `vercel/vercel-plugin` para Codex, con alcance de usuario, usando el instalador oficial `plugins`. Informó instalación de `vercel@openai-curated` y pidió reiniciar el agente para cargarlo. No se instaló además el paquete alternativo de skills.
- Se agregó el servidor MCP `vercel` con el endpoint oficial `https://mcp.vercel.com`, después de comprobar que no existía. Se inició el flujo de autorización para que lo complete Agus. No se alteraron configuraciones de servidores ajenos ni políticas de aprobación.
- Agus completó el inicio de sesión de la CLI mediante el navegador. No se copiaron credenciales al repositorio.

## Archivos y configuración afectados

- Este registro es el único cambio del repositorio asociado a la preparación de herramientas.
- Fuera del repo: instalación global de pnpm/Vercel en AppData/Local/pnpm, variables de usuario PNPM_HOME/PATH, instalación del plugin y configuración de MCP en el perfil de Codex.
- Las credenciales de sesión pertenecen a la configuración local de las herramientas; no se incluyen en este documento ni en Git.

## Verificación realizada y resultados

- `vercel --version`: 65.14.0.
- `vercel whoami`: cuenta `trombaagustin2-3417`, autenticada.
- `vercel project ls`: se encontró `food-store` bajo `carpincho-team`, con URL https://food-store-psi-three.vercel.app.
- `codex mcp get vercel`: servidor habilitado, transporte streamable_http, endpoint oficial correcto. Esto verifica configuración, no autenticación.
- El instalador del plugin informó éxito. Sus herramientas/comandos todavía no aparecieron en esta sesión: falta verificar su carga después de reiniciar o refrescar el agente.
- GET público a https://food-store-psi-three.vercel.app/api/health/db: HTTP 503, cuerpo `{"status":"error","database":"unavailable"}`. La conexión publicada a Neon todavía no está validada. Esta respuesta por sí sola no identifica la causa.
- No se ejecutó build porque no se modificó el código de la aplicación.

## Pendientes y coordinación

- Completar la autorización del servidor MCP en el navegador y verificar una consulta autenticada de solo lectura (`list_teams`) cuando las herramientas estén cargadas. La consulta MCP de documentación también queda pendiente hasta entonces.
- Reiniciar o refrescar Codex si el plugin y las herramientas de Vercel no aparecen.
- Revisar la configuración de DATABASE_URL en Vercel y repetir la verificación publicada. No cerrar #3 mientras siga respondiendo 503.
- La preparación global es de la computadora de Agus: Fausto no recibe esos accesos al hacer pull. No necesita repetirla para usar el código de la conexión a Neon.
- No se implementaron tareas de Fausto ni las funcionalidades #5 a #11 de Agus en esta sesión.

## Continuación: autorización y diagnóstico (2026-11-12)

- El proceso de autorización MCP terminó con `Successfully logged in`. Las herramientas MCP de Vercel todavía no aparecen en esta sesión; la prueba específica `list_teams` sigue pendiente de carga. Se continúa con la CLI oficial ya autenticada.
- Se vinculó esta copia con el proyecto existente `carpincho-team/food-store` usando `vercel link --yes --scope carpincho-team --project food-store`. No se creó otro proyecto ni se modificó el código de la aplicación.
- El enlace creó `.vercel/project.json` y `.env.local` (con un token local de Vercel). Ambos están excluidos de Git. Ese token no reemplaza DATABASE_URL.
- `vercel env ls --scope carpincho-team` confirmó que el proyecto no tiene variables de entorno configuradas. DATABASE_URL no está disponible en Vercel ni en esta copia local al iniciar la sesión; se solicitó a Agus que la agregue al archivo local, sin exponerla en el chat.
- El CLI añadió una regla redundante `.vercel` a `.gitignore`; se conserva documentada. La regla previa `.vercel/` ya protegía el directorio.
- No se ejecutó una nueva publicación: primero se necesita la conexión de Neon y validar que funciona. #3 sigue pendiente.
- Archivos versionados afectados por esta continuación: `.gitignore` y este registro. Los archivos con credenciales permanecen fuera de Git.
- Se instalaron correctamente las dependencias locales con `pnpm install --frozen-lockfile` (88 paquetes), sin cambios al archivo de bloqueo. `git diff --cached --check` pasó para la documentación y la regla de exclusión.
