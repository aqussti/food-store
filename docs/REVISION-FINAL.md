# Revisión final — 16/11/2026

Responsable: Agustín Tromba (@aqussti). Agente: Codex. Revisión de escritorio y del guion solicitada por Agus; no atribuye ensayos humanos a Fausto.

## Evidencia ejecutada

| Área / pasos del guion | Resultado y alcance |
|---|---|
| Compilación | `pnpm build` aprobada. |
| Carrito y búsqueda (1) | 4 pruebas Node aprobadas: datos inválidos, cantidades, búsqueda combinada y centavos. Catálogo y carrito revisados visualmente en navegador local. |
| Registro, sesión y permisos (2, 12) | `tests/auth-integration.mjs` aprobado contra Vercel: registro nuevo, sesión, Cliente rechazado en panel, Empleado admitido, encabezado falso rechazado, baja y login. |
| Compra y pago (3, 8, 9) | `scripts/smoke-published.mjs` aprobado contra Vercel: tres roles, catálogo Neon, pedido, total del servidor, rechazo, aprobación concurrente, privacidad y acceso al panel. Limpia sus datos temporales. |
| Reglas del negocio (3–12) | 28 pruebas Vitest aprobadas en esquema temporal de Neon, eliminado al terminar: transacciones, concurrencia, devoluciones, estados, precios históricos, bajas, perfil, aislamiento, usuarios y métricas. |
| Pantallas adaptables | Inicio y carrito de escritorio revisados en navegador local; inicio también a 1024 px y móvil a 468 px. Sin desbordamiento horizontal de la página; los carruseles mantienen desplazamiento propio. |

Las pruebas de servicios aislados no equivalen a ejecutar manualmente cada formulario administrativo en producción. El guion está revisado con preparación de datos, orden de operaciones y resultados esperados; queda el ensayo humano completo entre ambos integrantes.

La prueba de registro publicada aprobada el 16/11 confirma la corrección de sesión de `12a5fd9`. Este resultado actualiza el pendiente histórico del registro del 13/11.

## Cómo cerrar los Issues

1. Abrir https://github.com/aqussti/food-store/issues y elegir un Issue asignado al integrante.
2. Revisar cada criterio de aceptación. Marcar solo los comprobados y referenciar el commit/PR correspondiente y la prueba realizada, sin cambiar autorías.
3. Si todos se cumplen, elegir **Close issue → Completed**. Si algo falla, dejar abierto y describir qué falta. No cerrar como “Not planned” una tarea terminada.
4. Cada integrante debe tener al menos 3 Issues cerrados y aportes propios vinculados, según la consigna. Fausto revisa sus #5, #8, #14, #15 y #16; Agus revisa #3, #4, #6, #7, #9, #10, #11, #12, #13 y #17. Son números de GitHub, distintos del roadmap.

Referencias reales: `f7c1c83` conexión de Fausto; `cd1bd31` panel de Fausto; `39ed2fe` tienda/accesos de Agus; `6befe36` cierre integral de Agus; `12a5fd9` corrección de registro de Agus. La integración está en PR #18. Para funcionalidades con ajustes posteriores, citar tanto el aporte original como la corrección.

No se cerraron Issues en esta revisión: el pedido fue explicar cómo hacerlo. El #17 se cierra después del ensayo final y de revisar los archivos de entrega.

## Pendientes de entrega del grupo

- Ensayar el guion en sesiones independientes y revisar que ambos pueden explicar su parte.
- Revisar README y BITACORA-IA.md, incluidas las entradas reconstruidas desde registros.
- Cerrar los Issues verificados conservando responsables y evidencias reales.
- Comprobar links y credenciales del TXT privado `Integrador-Tromba-Rivero.txt` y subirlo al aula virtual. No subir contraseñas al repositorio.
