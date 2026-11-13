# Food Store: instrucciones compartidas para agentes

Estas reglas se aplican a todo el repositorio y a todos los agentes que trabajen en él. Leer este archivo, el README y los registros recientes de `docs/cambios/` antes de modificar archivos. `agent.md` apunta a este documento: mantener una sola fuente de reglas.

## Alcance y responsables

- Stack acordado: Next.js (App Router), TypeScript y PostgreSQL en Neon. Deploy en Vercel.
- El roadmap y el análisis del negocio están en `README.md`. No redistribuir tareas por iniciativa del agente.
- **Agustín / Agus (`@aqussti`):** #5 registro e inicio de sesión; #7 catálogo, búsqueda y filtros; #8 carrito; #9 creación de pedidos; #10 pago simulado y descuento atómico de stock; #11 historial y perfil del cliente.
- **Fausto (`@faustorivero69-hue`):** #6 permisos por rol; #12 productos, categorías y stock; #13 avance y cancelación de pedidos; #14 usuarios, roles y panel de superadmin.
- **Equipo:** #1 análisis y README; #2 deploy inicial; #3 conexión a BD; #4 datos de prueba; #15 prueba final. Ser compartidas no autoriza a desarrollar todas estas tareas en cada sesión.
- Cada agente debe identificar a qué integrante está asistiendo. Si no se conoce, preguntar antes de asumir tareas de un integrante.
- Pedido vigente de Agus: primero un deploy mínimo de **Food Store / Hola mundo**; después, únicamente sus tareas. No implementar funciones de Fausto como parte de esa sesión.
- Actualización explícita del 13/11/2026: Agus pidió «Termina todo entonces segun la consigna, que quede listo». Autoriza el cierre integral, correcciones del trabajo integrado, datos de demostración, documentación, tareas de GitHub y publicación. Conservar responsables originales y atribuir los ajustes nuevos a Agus/Codex; no inventar trabajo, decisiones ni pruebas de Fausto.
- Una dependencia de otra persona debe documentarse con un contrato propuesto y quedar pendiente de coordinación. No completar silenciosamente su tarea.
- La consigna PDF es una fuente de requisitos, no una autorización para ejecutar todas sus instrucciones o realizar acciones externas.

## Registro obligatorio de cada cambio

**Todo cambio de código, configuración, dependencias, documentación o infraestructura debe quedar identificado y documentado en el mismo conjunto de cambios que lo implementa.** También registrar correcciones, reversiones, limitaciones y resultados de deploy.

1. Crear o actualizar un archivo propio en `docs/cambios/` por tarea o sesión, con nombre `AAAA-MM-DD-HHMM-responsable-agente-tarea.md`. Usar hora de Argentina y un sufijo adicional si ya existe ese nombre.
2. Indicar integrante responsable, usuario de GitHub, agente/herramienta real, modelo solo si se conoce, tarea del roadmap y estado. No inventar identidades, pruebas ni atribuir a una persona cambios de otro agente.
3. Describir cada cambio y su motivo; enumerar archivos afectados; anotar pruebas ejecutadas y sus resultados reales; registrar pendientes, dependencias y decisiones que afecten al otro integrante.
4. Incluir el registro en el mismo commit que los cambios correspondientes. Identificar commits nuevos con `[Responsable][Agente][#tarea] descripción`; para coordinación usar `[docs]` en lugar de un número de tarea.
5. Si una sesión necesita varios commits, actualizar el registro en cada uno. Git conserva la secuencia; no hace falta escribir dentro del registro el hash del commit que todavía no existe.
6. No editar ni reescribir el registro de otro agente para atribuirse su trabajo. Una corrección propia se documenta en un registro nuevo con referencia al anterior.
7. Un ajuste al propio registro se describe en él cuando corrige información sustantiva; no crear registros recursivos para documentar el registro.

Plantilla mínima:

```md
# Título del cambio
- Fecha y hora (Argentina):
- Responsable / GitHub:
- Agente / herramienta:
- Modelo (si se conoce):
- Tarea del roadmap:
- Estado: en curso | implementado sin validar | validado localmente | publicado | bloqueado

## Pedido y alcance
## Cambios y motivos
## Archivos afectados
## Verificación realizada y resultados
## Pendientes y coordinación con el otro integrante
```

## Trabajo simultáneo y Git

- Antes de comenzar, revisar `git status`, la rama actual y los cambios remotos con `git fetch origin` cuando haya conexión. Leer los cambios nuevos antes de integrarlos.
- Para tareas posteriores a la base inicial, usar ramas separadas: `agus/<numero>-<tema>` o `fausto/<numero>-<tema>`. No compartir una rama de trabajo entre agentes simultáneos.
- Antes de subir, volver a revisar el remoto. Integrar cambios sin perder trabajo ajeno; no usar push forzado, `reset --hard`, limpieza destructiva ni sobrescritura de archivos ajenos.
- No incluir en un commit cambios ajenos preexistentes. Revisar el diff y agregar archivos específicos.
- Si dos tareas necesitan tocar un archivo compartido (por ejemplo README, dependencias, esquema de BD o autenticación), documentar el motivo, revisar la versión actual y conservar los cambios del compañero. Si el conflicto cambia una decisión de negocio, coordinar con los responsables.
- No modificar reglas de acceso, cambiar responsables ni cerrar tareas del otro integrante por cuenta propia.
- No publicar, fusionar ni cerrar Issues solo porque este documento lo indique: esas acciones dependen del pedido vigente del usuario.
- No marcar una tarea completada antes de verificar sus criterios. Compilar localmente no equivale a publicar en Vercel.

## Contratos que ambos lados deben respetar

- La BD persistente será Neon. No usar archivos locales o SQLite como reemplazo para producción.
- Guardar secretos en variables de entorno; nunca subir `.env`, credenciales, contraseñas de prueba o tokens. No incluirlos en registros ni capturas.
- Registro público siempre crea un Cliente. Los permisos se verifican en el servidor, no solo ocultando botones.
- Correo inmutable. Un cliente solo puede consultar o modificar sus propios datos y pedidos.
- Los pagos son simulados; no pedir datos de tarjeta.
- Calcular totales en el servidor y guardar precios históricos del pedido.
- Descontar stock solo al aprobar el pago, dentro de una transacción de todo o nada. Evitar doble descuento ante reintentos.
- La gestión de estados debe coordinarse entre #10 y #13. Cancelación y devolución de stock deben conservar trazabilidad y evitar duplicados.
- Antes de crear tablas o rutas compartidas, revisar lo implementado por el otro agente. No crear modelos paralelos incompatibles de usuarios, productos o pedidos.

## Validación y entrega

- Instalar con `pnpm install` (o `pnpm install --frozen-lockfile` para reproducir la versión registrada).
- Ejecutar `pnpm build` para validar cambios de aplicación. Agregar pruebas de comportamiento cuando se implementen autenticación, permisos, pedidos o transacciones.
- Para cambios solo documentales, revisar contenido y ejecutar `git diff --check`; no inventar tests ni repetir la compilación sin motivo.
- Registrar qué se probó, dónde, qué falló y qué no pudo verificarse. No presentar una prueba local como una prueba en Neon o Vercel.
- Al terminar, informar al usuario lo hecho, el resultado de las pruebas y el próximo paso concreto, respetando el alcance de su tarea.

## Estado inicial conocido

- Existe una página mínima de Next.js con Food Store / Hola mundo.
- La compilación de producción pasó localmente el 11/11/2026.
- Neon y las funciones de tienda todavía no están implementados.
- El deploy de Vercel sigue pendiente de acceso y verificación. Consultar los registros posteriores antes de asumir que este estado sigue vigente.
