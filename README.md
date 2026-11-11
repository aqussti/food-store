Food Store - TP Integrador 🍔

Food Store es una tienda de comida 100% digital. Los visitantes pueden explorar el catálogo y armar carritos; los clientes registrados simulan compras; y el personal gestiona inventario, despacha pedidos y visualiza métricas mediante un sistema estricto de roles.

Construida con [Next.js / Python] y PostgreSQL ([Neon / Supabase]) utilizando vibecoding (OpenCode/Antigravity).

🔗 App publicada: [Tu enlace de Vercel aquí]

🗺️ Roadmap a la Versión 1.0 (Tareas y Responsables)

El desarrollo está dividido en 5 etapas para asegurar un trabajo equitativo y sin conflictos de código. Las etapas 1 y 5 (cimientos y revisión) se hacen en conjunto.

🧑‍💻 Fausto (@tu-usuario-github) - Gestión, Stock y Control:

[ ] #6 Configurar permisos por rol desde el servidor.

[ ] #12 CRUD de productos/categorías y alerta de stock bajo.

[ ] #13 Flujo de avance y cancelación de pedidos.

[ ] #14 Gestión de usuarios, roles y Panel de Superadmin.

🧑‍💻 Agustín (@tu-usuario-github) - Tienda, Accesos y Cliente:

[ ] #5 Registro e inicio de sesión de usuarios.

[ ] #7 Catálogo público, buscador y filtros.

[ ] #8 Lógica del carrito de compras.

[ ] #9 Creación y registro del pedido en BD.

[ ] #10 Pago simulado y descuento de stock (todo o nada).

[ ] #11 Historial de pedidos y edición de perfil del cliente.

🤝 Equipo - Cimientos y Cierre:

[ ] #1 Redactar README y Análisis.

[ ] #2 Deploy inicial en Vercel (página "Hola Mundo").

[ ] #3 Conectar Base de Datos externa.

[ ] #4 Cargar datos de prueba (12 productos, 3 roles, etc.).

[ ] #15 Prueba final cruzada (Guion de Demo UTN).

📋 Análisis del Negocio (Requisitos UTN)

1. Roles y Accesos

Visitante: Mira el catálogo y arma carrito temporal.

Cliente: Registra pedidos, paga (simulado) y ve su historial.

Empleado: Maneja stock, catálogo y avanza pedidos. No compra.

Superadmin: Todo lo anterior + cambia roles y ve métricas de ventas.

2. Ciclo de Vida del Pedido

Pendiente: Creado, sin pagar.

Confirmado: Pagado. Acá baja el stock.

En preparación: Cocina.

En camino: Despachado.

Entregado o Cancelado: Estados finales (el stock vuelve si se cancela).

3. Historias de Usuario Principales

Como empleado, quiero actualizar el estado de los pedidos (a "En preparación", "En camino" o "Entregado"), para mantener el flujo de entrega y que el cliente sepa dónde está su comida.
Criterios de aceptación:

Solo los roles Empleado y Superadmin pueden realizar esta acción.

Un pedido no puede saltear estados intermedios ni retroceder a un estado anterior.

El avance del estado debe quedar registrado en el historial del pedido (quién y cuándo).

Como empleado, quiero poder cancelar un pedido en estado "Pendiente" o "Confirmado", para frenar compras que no podemos cumplir y liberar la mercadería.
Criterios de aceptación:

Si el pedido ya estaba "Confirmado", el stock reservado debe volver a sumarse automáticamente al inventario.

Debe exigirse seleccionar o escribir un motivo de cancelación que quedará en el historial.

Si el pedido ya pasó a "En preparación", el botón de cancelar debe desaparecer para el Empleado (solo el Superadmin puede cancelarlo en esa etapa).

Como cliente, quiero ver el historial de mis pedidos con el detalle de cada uno, para revisar qué he comprado y en qué estado está mi compra actual.
Criterios de aceptación:

El cliente debe ver un listado ordenado del pedido más reciente al más antiguo.

Cada pedido debe mostrar el precio histórico que se pagó en ese momento, independientemente de si el producto cambió de precio en el catálogo actual.

Un cliente jamás debe poder ver los pedidos o datos de otra cuenta.

Como superadmin, quiero gestionar los permisos cambiando el rol de un usuario (entre Cliente, Empleado y Superadmin), para dar acceso administrativo a los nuevos trabajadores.
Criterios de aceptación:

El cambio de rol se aplica en el servidor y rige la próxima vez que esa persona inicie sesión.

El sistema debe validar que el último Superadmin activo no pueda quitarse el rol a sí mismo ni darse de baja.

4. Reglas de Negocio Clave

(Además de las 11 reglas obligatorias del sistema detalladas en la consigna, se implementan estrictamente las siguientes tres reglas propias):

RN12 (Inmutabilidad del correo): El correo electrónico de un usuario actúa como su identidad única en la base de datos; una vez registrado, no puede ser modificado por ningún rol (ni Cliente, ni Empleado, ni Superadmin). Si un usuario cambia de correo, debe crear una cuenta nueva.

RN13 (Lógica del costo total): El monto total de un pedido siempre debe calcularse en el servidor como la suma estricta de (precio histórico * cantidad) de cada producto incluido, más el costo de envío fijo. El sistema debe rechazar cualquier intento de manipular el total final desde el navegador.

RN14 (Protección de stock negativo en edición): Al crear o editar un producto desde el panel de control (Empleado/Superadmin), el sistema debe rechazar valores negativos tanto para el "stock actual" como para el "stock mínimo", arrojando un mensaje de error si se intenta guardar un valor menor a cero.