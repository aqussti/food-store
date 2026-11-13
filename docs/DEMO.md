# Guion de defensa — 15 minutos

Abrir la app publicada en ventanas separadas para Cliente, Empleado y Superadmin. Las credenciales están en el archivo privado para el aula. No mostrar contraseñas ni variables de entorno en la defensa.

1. Visitante: buscar, filtrar, abrir detalle, agregar/quitar y cambiar cantidades del carrito.
2. Registrarse: no existe selector de rol; la cuenta es Cliente.
3. Crear pedido con dirección. Ver envío fijo y precios. Rechazar pago: sigue pendiente; aprobar: confirmado y baja stock.
4. Abrir historial y detalle. Editar teléfono/dirección en Mi cuenta; el correo no tiene edición.
5. Empleado: avanzar confirmado → preparación → camino → entregado. Ver autor y fecha en historial; no se pueden saltear estados.
6. Cambiar precio de un producto y comprobar que el pedido anterior conserva el suyo.
7. Dar de baja un producto: sale del catálogo pero sigue en pedidos. Mostrar stock bajo con stock <= mínimo.
8. Crear/pagar otro pedido. Empleado cancela Confirmado con motivo: stock vuelve una vez.
9. Crear pedido con dos productos y dejar uno sin stock desde el panel. Aprobar: falla sin descontar ninguno y sigue pendiente.
10. Superadmin: crear usuario, editar nombre/teléfono/dirección, cambiar rol y dar de baja; la cuenta no vuelve a ingresar. Mostrar ventas, seis estados y producto más vendido.
11. Intentar quitarse rol/desactivarse siendo último Superadmin: el servidor lo rechaza.
12. Cliente: abrir /admin/usuarios y un /pedidos/ID de otra cuenta; acceso rechazado.

Extras de control: Cliente cancela solo Pendiente; Superadmin puede cancelar En preparación, nunca En camino. Repetir pago aprobado no duplica descuento. Los dos botones de pago nunca piden tarjeta.

## Dónde explicar el código

- Agus: lib/shop.ts (transacciones, precios e identidad), app/api/store, componentes de carrito/pedidos/perfil y lib/auth-options.ts.
- Fausto: lib/admin/products.ts, lib/admin/orders.ts, lib/admin/users.ts, lib/auth/roles.ts. Distinguir ajustes finales de Agus, identificados en docs/cambios.
- La base vive en Neon porque Vercel no conserva archivos locales como almacenamiento permanente.
- El bloqueo de filas serializa operaciones concurrentes; COMMIT aplica todo y ROLLBACK deshace el intento completo.
- El nombre/precio del ítem representa el hecho histórico; las bajas lógicas conservan trazabilidad.

La verificación automática complementa la práctica humana, no la reemplaza. Cada integrante debe poder mostrar sus Issues y explicar su aporte.
