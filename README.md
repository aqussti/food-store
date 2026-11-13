# Food Store — TP Integrador

**App:** https://food-store-psi-three.vercel.app · **Repositorio:** https://github.com/aqussti/food-store

## El negocio

Food Store es una tienda digital educativa de alimentos, bebidas y productos de almacén. Vende a clientes que necesitan explorar productos, indicar una dirección y seguir su pedido. La aplicación conecta ese recorrido con el trabajo del personal: mantener un inventario confiable, preparar pedidos y registrar quién cambia su estado. El carrito no reserva mercadería; un pedido pendiente conserva el compromiso y sus precios, y el pago aprobado descuenta stock. El responsable de la empresa administra cuentas y consulta ventas. Los pagos, productos y cuentas de demostración son ficticios: no hay cobros, tarjetas ni envíos reales.

## Integrantes y responsabilidades

| Integrante | GitHub | Parte original |
|---|---|---|
| Agustín Tromba | @aqussti | Registro, tienda, carrito, creación/pago de pedidos, historial y perfil |
| Fausto Rivero | @faustorivero69-hue | Permisos, productos/categorías/stock, gestión de pedidos, usuarios y métricas |

El 13/11 Agus autorizó a Codex completar la integración y los faltantes de la consigna. Esas correcciones se atribuyen a Agus/Codex, sin reescribir el trabajo de Fausto/OpenCode. El historial y [docs/cambios](docs/cambios/) permiten identificar cada aporte.

## Roles y permisos

- **Visitante:** explora, filtra y arma un carrito local. Debe registrarse para comprar.
- **Cliente:** se registra siempre con este rol; crea y paga sus pedidos, consulta solo sus datos e historial, edita teléfono/dirección y cancela pedidos pendientes.
- **Empleado:** mantiene productos, categorías y stock; consulta pedidos, los prepara y despacha. No compra ni accede a usuarios o métricas de ventas.
- **Superadmin:** hace lo del empleado y administra usuarios/roles y métricas. No compra. La última cuenta activa de este rol está protegida.

Todos los permisos se comprueban en el servidor. Dar de baja una cuenta impide nuevos ingresos e invalida sus sesiones; los pedidos se conservan. Un cambio de rol invalida las sesiones existentes y exige un nuevo ingreso con el rol actualizado. Los datos sensibles nunca se toman del rol o total enviado por el navegador.

## Ciclo del pedido

1. **Pendiente:** el Cliente registra el pedido; se valida stock y se guardan productos, cantidades, precio histórico, dirección y envío fijo de $1500. Todavía no baja el stock.
2. **Confirmado:** exclusivamente al aprobar el pago simulado, con descuento completo de stock dentro de una transacción. Rechazar el pago deja el pedido pendiente.
3. **En preparación → En camino → Entregado:** avance secuencial por Empleado o Superadmin, con autor y fecha en el historial.
4. **Cancelado:** Cliente solo en Pendiente; Empleado en Pendiente/Confirmado; Superadmin también en En preparación. En camino y Entregado no admiten cancelación. Si el pedido se había pagado, se devuelve el stock una sola vez. Es obligatorio un motivo.

## Historias y criterios de aceptación

| Historia | Criterios verificables |
|---|---|
| Como visitante quiero buscar y filtrar para encontrar lo que necesito. | Nombre y categoría se combinan; búsquedas sin resultados muestran un estado vacío. |
| Como visitante quiero armar un carrito para organizar mi compra. | Agregar/quitar/cambiar cantidades actualiza el subtotal; recargar conserva el carrito y no afecta stock. |
| Como cliente quiero registrarme para acceder a mis compras. | El alta crea siempre Cliente; correo duplicado se rechaza y contraseña se guarda como hash. |
| Como cliente quiero registrar un pedido para conservar lo que solicité. | El servidor valida stock y calcula el total; guarda dirección, envío y precios históricos. |
| Como cliente quiero pagar de forma simulada para confirmar mi pedido. | Aprobar descuenta todo o nada; rechazar mantiene Pendiente y permite reintentar. |
| Como cliente quiero consultar mis pedidos y datos para seguir la entrega. | Solo veo mis pedidos, del más reciente al más antiguo; puedo editar teléfono/dirección, nunca correo. |
| Como empleado quiero mantener el catálogo para ofrecer información correcta. | Puedo crear/editar y dar bajas lógicas; un producto dado de baja desaparece del catálogo y conserva su historial. |
| Como empleado quiero revisar el stock bajo para planificar reposición. | Se muestran productos con stock <= mínimo; aumentar stock los retira de la alerta. |
| Como empleado quiero preparar pedidos para organizar las entregas. | Solo se permite el siguiente estado; cada avance/cancelación guarda autor, fecha y motivo cuando corresponde. |
| Como superadmin quiero administrar cuentas para separar responsabilidades. | Puedo crear, editar, desactivar y cambiar roles; no puedo quitar o desactivar al último Superadmin. |
| Como superadmin quiero ver indicadores para conocer el negocio. | Ventas suman pagos no cancelados; veo pedidos por cada estado y producto más vendido por unidades pagadas no canceladas. |

## Reglas de negocio

| Regla | Comportamiento |
|---|---|
| R1 | Pago y descuento de todos los productos son una sola transacción; si falta uno se revierte todo. |
| R2 | Rechazar el pago mantiene Pendiente y permite reintentar. |
| R3 | Stock nunca negativo; cancelar un pedido pagado devuelve stock una sola vez. |
| R4 | Los ítems conservan nombre y precio histórico. |
| R5 | Estados secuenciales, sin retrocesos, con historial de quién/cuándo/motivo. |
| R6 | Cancelaciones limitadas por rol y estado; nadie cancela En camino o Entregado. |
| R7 | El Cliente solo accede a sus datos y pedidos. |
| R8 | Autorización en servidor en cada operación protegida. |
| R9 | Contraseñas almacenadas como hash, nunca texto legible. |
| R10 | Último Superadmin activo protegido de baja y degradación. |
| R11 | Productos y usuarios se dan de baja lógicamente; se conserva la historia. |
| RN12 propia | Correo inmutable para todos los roles; cambiarlo requiere otra cuenta. |
| RN13 propia | Total = suma de cantidades × precios históricos + envío fijo, calculado en servidor; se ignoran importes enviados por el navegador. |
| RN14 propia | La edición rechaza stock actual o mínimo negativos. |

Los reintentos de crear un pedido usan una referencia única; los pagos repetidos no duplican el descuento. Las operaciones de stock bloquean filas durante la transacción para resolver compras simultáneas.

## Tecnologías y decisiones

Next.js App Router y TypeScript permiten integrar pantallas y servidor en Vercel. Neon PostgreSQL conserva los datos fuera de los archivos efímeros del despliegue y soporta transacciones. Better Auth resuelve hashes y sesiones; las reglas de negocio están en nuestros servicios. El carrito usa almacenamiento del navegador porque todavía no es un pedido. Las ilustraciones son placeholders solicitados por Agus. No se agregaron cobros reales, recuperación de contraseña ni extras opcionales.

Agentes: Codex para Agus; OpenCode (DeepSeek V4.1 Flash Free según su registro) para Fausto. Elegidos por disponibilidad y por permitir revisar cambios y pruebas; el agente no reemplaza la explicación de los integrantes. Ver [BITACORA-IA.md](BITACORA-IA.md).

## Ejecución y datos de demostración

Requiere Node >=22.18 y pnpm 11.25.0. Copiar `.env.example` a `.env.local`, completar DATABASE_URL de Neon y ejecutar:

```sh
pnpm install
pnpm auth:setup
pnpm db:migrate
pnpm dev
```

En Vercel configurar DATABASE_URL, BETTER_AUTH_SECRET y BETTER_AUTH_URL con el dominio publicado. Preview usa VERCEL_URL. No subir `.env.local`. `pnpm db:migrate` prepara primero accesos y después migraciones administrativas; `db/auth/001-auth.sql` es una referencia, no debe aplicarse manualmente sobre tablas existentes.

El seed `scripts/seed-demo.mjs` carga al menos 12 productos, 3 categorías y una cuenta por rol. Se ejecuta con `.env.local` y `DEMO_CREDENTIALS_PATH` apuntando a un archivo privado fuera del repo. No sobrescribe inventario ni contraseñas existentes. Las credenciales se entregan solo en el aula virtual, nunca aquí.

## Verificación y entrega

```sh
pnpm test
pnpm build
node --env-file=.env.local scripts/test-isolated.mjs
```

La última orden crea un esquema temporal QA en Neon, ejecuta las pruebas y elimina solo ese esquema. Comprueba pago atómico, concurrencia, reintentos, historial, privacidad, cancelaciones, catálogo y administración. `pnpm test:auth` requiere un servidor iniciado y crea/elimina únicamente su cuenta efímera. Ver [guion de demo](docs/DEMO.md) y [registro de cierre](docs/cambios/2026-11-13-agus-codex-cierre.md) para resultados reales.

## Roadmap y tareas en GitHub

Los números originales 1–15 eran del roadmap. Se registraron retrospectivamente como Issues #3–#17, con responsables y criterios. No se inventaron fechas ni se cambió la autoría de commits.

| Roadmap | Issue | Responsable |
|---|---|---|
| 1 Análisis | #3 | Agus |
| 2 Publicación | #4 | Agus |
| 3 Neon | #5 | Fausto |
| 4 Datos demo | #6 | Agus |
| 5 Accesos | #7 | Agus |
| 6 Permisos | #8 | Fausto |
| 7 Catálogo | #9 | Agus |
| 8 Carrito | #10 | Agus |
| 9 Pedidos | #11 | Agus |
| 10 Pago | #12 | Agus |
| 11 Perfil/historial | #13 | Agus |
| 12 Productos/stock | #14 | Fausto |
| 13 Gestión de pedidos | #15 | Fausto |
| 14 Usuarios/métricas | #16 | Fausto |
| 15 Prueba final | #17 | Agus |

Estado verificable: [Issues del repositorio](https://github.com/aqussti/food-store/issues?q=is%3Aissue). Leer [AGENTS.md](AGENTS.md) y [agent.md](agent.md) antes de trabajar; cada agente documenta sus cambios y pruebas en su propio registro.
