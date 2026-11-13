# Integración de accesos de Agus con el panel de Fausto

- Fecha (Argentina): 2026-11-12, sesión de integración.
- Responsable: Agus / @aqussti.
- Agente: Codex.
- Tarea: #5 e integración autorizada de la rama de Fausto.
- Estado: validado localmente; sin despliegue de esta integración.

## Pedido y alcance

Agus autorizó expresamente integrar `fausto/6-12-13-14-panel` y conectar su inicio de sesión. Se conserva el commit cd1bd31 y su registro original. El desarrollo administrativo sigue siendo de Fausto/OpenCode; los ajustes de unión descriptos aquí son de Agus/Codex. No se agregan compras, pagos, historial ni semillas.

## Cambios y motivos

- `lib/auth/current-user.ts`: verifica la sesión de Better Auth y usa únicamente su id para consultar rol y estado actual en la tabla compartida. Se elimina la suplantación mediante `x-food-store-dev-user-id` incluso en desarrollo. Los permisos originales de Fausto siguen verificando cuenta activa y rol en servidor.
- `app/cuenta/page.tsx`, `components/account-view.tsx`: enlace al panel para cuentas habilitadas; visibilidad calculada en servidor, sin reemplazar los controles de acceso administrativos.
- `components/store-shell.tsx`, `app/layout.tsx`, `app/globals.css`: el panel conserva su distribución independiente y sus estilos quedan acotados a `.admin-route`; la tienda mantiene el diseño naranja/crema. Se corrige el contraste del enlace Ingresar agregado al acceso restringido.
- `app/admin/_components/access-denied.tsx`: acceso directo al inicio de sesión.
- `package.json`, `pnpm-lock.yaml`, `vitest.config.mts`: resolución de conflictos conservando Better Auth, iconos y Vitest; ejecución conjunta de pruebas Node y Vitest, sin que Vitest recoja las pruebas Node. Node mínimo 22.18 por la ejecución de TypeScript nativo.
- `db/auth/001-auth.sql`, `scripts/auth-schema.mjs`: el SQL de referencia de accesos sale del directorio recorrido por las migraciones administrativas; evita recrear tablas existentes. `pnpm db:migrate` ejecuta primero el migrador introspectivo de accesos y después el de Fausto. El plan vacío se reconoce por las listas de cambios, porque Better Auth compila `;` aun sin cambios.
- `tests/current-user.test.ts`, `tests/auth-integration.mjs`: verificaciones de sesión real, cuenta inexistente/desactivada y encabezados falsos.
- README y agent.md enlazan el contrato y registro actualizado. Los demás archivos administrativos se incorporan desde la rama de Fausto sin atribuirlos a Agus.

## Verificación realizada

- `pnpm test`: 4 pruebas Node y 15 Vitest aprobadas. Las 7 de integración administrativa de Fausto se omiten sin TEST_DATABASE_URL; no se afirma haberlas ejecutado en esta sesión.
- `pnpm build`: aprobado, incluidas las rutas del panel y Mi cuenta dinámica.
- `pnpm test:auth`: aprobado contra el servidor local y Neon. Registro, credenciales, sesión, correo duplicado/inmutable, origen, cierre e ingreso; Cliente rechazado por el panel; Empleado admitido; header falso rechazado; cuenta desactivada rechazada conservando sesión. Solo se modificó el usuario efímero creado por la prueba y se eliminó al finalizar.
- `pnpm db:migrate`: reconoce autenticación actualizada y migración administrativa ya aplicada. El primer intento ejecutó únicamente el SQL vacío `;`; se corrigió su detección, sin modificaciones de esquema ni datos reales.
- Revisión visual del acceso restringido y continuidad de la tienda. Corrección de contraste descubierta en esa revisión.
- La instalación inicial no materializó Vitest; se resolvió con `pnpm add -D vitest@^5.1.0` antes de las verificaciones exitosas.

## Coordinación y pendientes

En una base nueva: configurar DATABASE_URL, ejecutar `pnpm auth:setup` y después `pnpm db:migrate`. Las tablas de accesos se preparan antes de la fundación administrativa. No ejecutar el SQL de referencia de db/auth manualmente sobre una base existente.

Vercel requiere BETTER_AUTH_SECRET estable (mínimo 32 caracteres) y BETTER_AUTH_URL con el dominio de producción. Preview usa VERCEL_URL. No se suben secretos ni se publica esta integración en producción desde esta sesión. El primer Superadmin y datos de catálogo siguen pendientes de la coordinación del equipo; no se promovieron cuentas reales.

La función compartida consulta el rol actual de la base en cada solicitud, tal como la capa original de Fausto; los cambios de rol se reflejan inmediatamente. Revisar con Fausto si #14 necesita específicamente retener el rol anterior hasta el próximo ingreso, como indica el README. No se cambia silenciosamente esa regla en esta integración.

Catálogo y carrito continúan con placeholders por pedido de Agus. #9, #10 y #11 siguen pendientes; esta entrega termina la conexión de #5 con el panel existente.
