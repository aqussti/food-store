# Verificación de Neon en Food Store publicado

- Fecha y hora (Argentina): 2026-11-12 00:32.
- Responsable / GitHub: Agustín (Agus), @aqussti.
- Agente / herramienta: Codex, asistente de Agus.
- Modelo: no consignado.
- Tareas del roadmap: verificación de #2 y finalización compartida de #3. La implementación de la conexión pertenece a Fausto/OpenCode; este registro cubre su configuración y validación en Vercel por Agus/Codex.
- Estado: publicado y verificado.

## Pedido y alcance

Continuar la configuración de Vercel y verificar la conexión a la base de Neon creada por Fausto. Agus guardó la cadena completa en su `.env.local`. No se implementaron funciones de la tienda ni tareas administrativas de Fausto.

## Cambios y motivos

- La primera cadena entregada localmente contenía la contraseña enmascarada con asteriscos y Neon rechazó la autenticación. Se identificó la causa sin mostrar credenciales. Agus reemplazó la cadena por la versión completa.
- Se validó la conexión corregida con el script de Fausto: `SELECT 1` contra Neon.
- Se guardó `DATABASE_URL` como tipo **Secret** en los entornos **Production y Preview** del proyecto existente `carpincho-team/food-store`. El valor se leyó del archivo ignorado y se transmitió por entrada estándar a Vercel; no se incluyó en argumentos, código, Git ni registros.
- Un primer intento no cambió variables porque PowerShell interpretó la lista de entornos como un array. Se corrigió pasando `production,preview` como una única cadena y Vercel confirmó la carga.
- Se volvió a publicar el despliegue de producción existente para aplicar la variable. No se creó otro proyecto ni se publicó código nuevo de la rama documental.
- Se actualizó README con la URL real, el estado de conexión, los entornos efectivamente configurados y las tareas #2 y #3 verificadas. No se cerraron Issues de otro integrante.

## Archivos y configuración afectados

- Versionados: `README.md` y este registro.
- Configuración externa: `DATABASE_URL` de Vercel (Production y Preview) y un nuevo deploy de producción.
- Local no versionado: `.env.local`, completado por Agus. Sigue excluido de Git.
- No se cambiaron `lib/db.ts`, el endpoint de salud, tablas ni datos del negocio.

## Verificación realizada y resultados

- `pnpm db:check`: correcto, `SELECT 1` devolvió `1` contra Neon.
- `vercel env ls`: `DATABASE_URL`, valor Hidden, tipo Secret, entornos Production y Preview.
- `vercel inspect --wait`: despliegue `dpl_6mqj1u7RnfikhHvGTAvShHUDmArM` en estado Ready. La compilación de Vercel terminó correctamente.
- URL del despliegue: https://food-store-oqveonyp2-carpincho-team.vercel.app.
- GET https://food-store-psi-three.vercel.app/api/health/db: HTTP 200, `{"status":"ok","database":"connected"}`.
- GET https://food-store-psi-three.vercel.app/: HTTP 200; contiene Hola mundo.
- `pg` conserva la advertencia de compatibilidad futura de `sslmode=require` ya observada por Fausto. No impide la conexión y no se modificó la cadena entregada por Neon.
- No se ejecutó otra compilación local: no se modificó código de aplicación y la compilación de producción ya se verificó en Vercel.

## Pendientes y coordinación

- Este resultado reemplaza el estado pendiente de #3 en los registros anteriores de configuración. La implementación y pruebas locales de Fausto siguen atribuidas a su registro original.
- Development en Vercel no tiene una copia de DATABASE_URL: para desarrollo local cada integrante usa su `.env.local`. No ejecutar `vercel env pull` sobre ese archivo sin conservar la conexión local, porque el entorno Development remoto no la contiene.
- Production y Preview usan por ahora la misma base del TP. Antes de realizar pruebas destructivas en previews, coordinar una base o rama Neon de prueba.
- Todavía no se crearon tablas ni datos de prueba (#4). La siguiente tarea de Agus es #5: registro e inicio de sesión. Coordinar el modelo de usuarios y el contrato de sesión con Fausto antes de su #6.
- El acceso MCP de Vercel completó OAuth, pero sus herramientas aún no se cargaron en esta sesión. La validación de esta entrega se realizó con la CLI oficial autenticada y solicitudes HTTP públicas.
