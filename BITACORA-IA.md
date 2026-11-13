# Bitácora de IA

Reconstrucción documental al 13/11/2026 a partir del historial y registros de cambios. No es una transcripción ni atribuye pruebas manuales no documentadas a los alumnos. Las pruebas automatizadas fueron ejecutadas por los agentes. Las entradas de Fausto se basan en su registro de OpenCode; se conserva su autoría original.

| Fecha | Integrante / agente | Pedido o decisión | Resultado y verificación/corrección |
|---|---|---|---|
| 11/11 | Agus / Codex | Comenzar con Hola mundo y Next.js. | Base compilada; se dejó el resto fuera del deploy inicial. Registro 2321. |
| 11/11 | Agus / Codex | Documentar cada cambio de cada agente. | AGENTS.md, agent.md y registros con identificación y pruebas; commit 45844c3. |
| 11/11 | Fausto / OpenCode | Conectar Neon mediante DATABASE_URL. | Pool reutilizable del servidor y healthcheck; commit f7c1c83 y registro 2354. |
| 12/11 | Agus / Codex | Configurar Vercel y verificar la base. | Se corrigió la conexión inicialmente copiada con contraseña enmascarada; luego healthcheck publicado exitoso. Registros de la rama agus/docs-vercel-setup. |
| 12/11 | Agus / Codex | Respetar solo las partes asignadas a Agus. | Se limitó el desarrollo a accesos/interfaz/carrito; no se tomó la consigna como autorización para todo el sistema. |
| 12/11 | Agus / Codex | Reproducir las referencias móviles con placeholders. | Diseño naranja/crema, carruseles y navegación inferior; carrito probado con persistencia y búsqueda. Commit 39ed2fe. |
| 12/11 | Fausto / OpenCode (DeepSeek V4.1 Flash Free) | Implementar permisos y panel administrativo. | Servicios con controles del servidor; implementación cd1bd31. Sesión real quedó pendiente de integración con Agus. |
| 12/11 | Fausto / OpenCode (DeepSeek V4.1 Flash Free) | Verificar productos, pedidos y usuarios en una rama Neon temporal. | Se corrigió la expectativa de un test: stock 3 con mínimo 2 no es stock bajo. Se cambió el dato de prueba a 1; segunda ejecución 18/18 según su registro. |
| 12/11 | Fausto / OpenCode (DeepSeek V4.1 Flash Free) | Aplicar esquema aditivo preservando Better Auth. | Migración administrativa idempotente y validación de tablas; no creó semillas ni afirmó deploy. Registro 1141. |
| 12/11 | Agus / Codex | Integrar la rama de Fausto con autorización expresa. | Sesión real reemplaza header de prueba; pruebas Cliente/Empleado/inactivo y compilación aprobadas. Commit 2a0b6ed. |
| 12/11 | Agus / Codex | Evitar conflictos entre migradores. | SQL de referencia de auth separado del directorio administrativo; se corrigió la detección del SQL vacío `;`. |
| 13/11 | Agus / Codex | Terminar todo según la consigna. | Auditoría encontró faltantes: alta/edición de usuarios, métricas completas y cancelación propia. Se implementaron sin reatribuir el trabajo original de Fausto. |
| 13/11 | Agus / Codex | Corregir la cancelación según R6. | El panel permitía al Superadmin cancelar En camino; se corrigió servidor y UI. Ahora nadie puede cancelar en ese estado. |
| 13/11 | Agus / Codex | Probar el circuito y compras simultáneas. | 28 pruebas integradas aprobadas en esquema aislado: rollback completo, rechazo, reintento, último stock, precios históricos y privacidad. |

Fuentes: [registros](docs/cambios/), commits indicados y [cierre](docs/cambios/2026-11-13-agus-codex-cierre.md). Cada integrante debe revisar esta reconstrucción y practicar la defensa de su parte; no se fabrica experiencia personal ni decisiones que no constan en las fuentes.
