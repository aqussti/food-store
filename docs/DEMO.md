# Guion de defensa — 15 minutos

Revisión final: 16/11/2026, Agus/Codex. App: https://food-store-psi-three.vercel.app. Ver evidencia y límites en [REVISION-FINAL.md](REVISION-FINAL.md).

## Preparación antes de empezar el reloj

- Usar perfiles o navegadores independientes para Cliente, Empleado y Superadmin. Ventanas normales del mismo perfil comparten sesión; varias ventanas incógnito también pueden compartirla.
- Las credenciales están en el archivo privado para el aula. No mostrar contraseñas ni variables de entorno en la defensa.
- Preparar dos productos exclusivos de ensayo (A y B), activos, con stock 10 y mínimo 2. Usarlos para cambios de precio, baja y falta de stock sin alterar los 12 productos base. Guardar los precios originales.
- Tener una segunda cuenta Cliente con un pedido y copiar su enlace para el paso 12. Preparar un correo ficticio distinto para el registro y otro para el alta administrativa; no reutilizar correos existentes.
- Anotar los ID de pedidos: P1 para entrega, P2 para cancelación y P3 para falta de stock. No intentar cancelar P1 después de entregarlo.
- Abrir el catálogo, panel y repositorio antes de la defensa. Tener a mano README, bitácora e Issues. Ensayar el recorrido completo entre ambos.

## Recorrido y resultados esperados

Distribución orientativa: pasos 1–4 Agus (4 minutos), 5–8 Fausto (4 minutos), 9 Agus (2 minutos), 10–11 Fausto (3 minutos), 12 y cierre conjunto (2 minutos). Son responsabilidades originales; los ajustes de integración se explican con su autoría real.

1. Visitante: buscar, filtrar, abrir detalle, agregar/quitar y cambiar cantidades del carrito.
2. Registrarse: no existe selector de rol; la cuenta es Cliente.
3. Crear P1 con dirección y 1 unidad de A. Ver envío fijo de $1500 y total calculado por servidor. Rechazar pago: sigue pendiente y stock 10; aprobar: confirmado y stock 9. El pago es simulado.
4. Abrir historial y detalle. Editar teléfono/dirección en Mi cuenta; el correo no tiene edición.
5. Empleado: avanzar confirmado → preparación → camino → entregado. Ver autor y fecha en historial; no se pueden saltear estados.
6. Cambiar precio de A y recargar P1: conserva el precio anterior. Mostrar la diferencia con el catálogo actualizado.
7. Dar de baja A: sale del catálogo pero sigue en P1. Reactivarlo antes de continuar. Mostrar la alerta con stock <= mínimo y restaurar A/B a 10 para los casos siguientes.
8. Crear/pagar P2 con 1 unidad de A (stock 10 → 9). Empleado cancela Confirmado con motivo: stock vuelve a 10 una vez; el pedido queda Cancelado y sin nuevas acciones.
9. Crear P3 con 1 unidad de A y B, ambos con stock 10. Después dejar B en 0 desde el panel. Aprobar: falla, A sigue en 10, B en 0 y P3 sigue Pendiente. Reponer B y cancelar P3 como Cliente para cerrar el ensayo.
10. Superadmin: crear usuario, editar nombre/teléfono/dirección, cambiar rol y dar de baja; la cuenta no vuelve a ingresar. Mostrar ventas, seis estados y producto más vendido.
11. Mostrar la protección de la cuenta Superadmin propia: los controles impiden quitarse rol o desactivarse y el servidor también lo rechaza. No presentar esto como prueba exclusiva del conteo del último Superadmin: existe una protección adicional de la cuenta propia. Explicar la comprobación de último activo en lib/admin/users.ts y sus pruebas.
12. Cliente: abrir /admin/usuarios y un /pedidos/ID de otra cuenta; acceso rechazado.

Extras de control: Cliente cancela solo Pendiente; Superadmin puede cancelar En preparación, nunca En camino. Repetir pago aprobado no duplica descuento. Los dos botones de pago nunca piden tarjeta.

## Dónde explicar el código

- Agus: lib/shop.ts (transacciones, precios e identidad), app/api/store, componentes de carrito/pedidos/perfil y lib/auth-options.ts.
- Fausto: lib/admin/products.ts, lib/admin/orders.ts, lib/admin/users.ts, lib/auth/roles.ts. Distinguir ajustes finales de Agus, identificados en docs/cambios.
- La base vive en Neon porque Vercel no conserva archivos locales como almacenamiento permanente.
- El bloqueo de filas serializa operaciones concurrentes; COMMIT aplica todo y ROLLBACK deshace el intento completo.
- El nombre/precio del ítem representa el hecho histórico; las bajas lógicas conservan trazabilidad.

La verificación automática complementa la práctica humana, no la reemplaza. Cada integrante debe poder mostrar sus Issues y explicar su aporte.

## Al terminar

Restaurar precio/stock de los productos de ensayo y darlos de baja si ya no se usan. Conservar pedidos e historial; no borrarlos para ocultar pruebas. Revisar la bitácora entre ambos, cerrar los Issues cuyos criterios comprobaron y subir el TXT privado al aula. El archivo de entrega nunca se publica en GitHub.
