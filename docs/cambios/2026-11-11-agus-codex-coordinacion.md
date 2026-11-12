# Reglas para identificar y documentar el trabajo de ambos agentes

- Fecha y hora (Argentina): 2026-11-11, sesión posterior a la compilación inicial; hora exacta no registrada.
- Responsable / GitHub: Agustín (Agus), @aqussti.
- Agente / herramienta: Codex, asistente de Agus en esta conversación.
- Modelo: no consignado.
- Tarea del roadmap: documentación y coordinación del equipo, relacionada con #1.
- Estado: documentación revisada localmente.

## Pedido y alcance

Agus informó que Fausto trabaja con otro agente y pidió documentar las reglas en agent.md, incluyendo la obligación de documentar e identificar cada cambio de cada agente.

## Cambios y motivos

- Se creó `AGENTS.md` como fuente única de instrucciones para agentes, con responsabilidades, alcance, documentación obligatoria, convenciones de commits, coordinación de archivos compartidos y validación.
- Se creó `agent.md` como entrada al documento canónico solicitado, evitando dos copias de reglas que puedan divergir.
- Se establecieron registros separados por integrante, agente y tarea en `docs/cambios/` para reducir conflictos simultáneos y conservar atribución.
- Se documentó retroactivamente la base de Hola mundo con las pruebas reales y sus pendientes.
- Se agregó al README una referencia visible a estas reglas y registros.

## Archivos afectados

`AGENTS.md`, `agent.md`, `README.md`, `docs/cambios/2026-11-11-2321-agus-codex-2-hola-mundo.md` y este registro.

## Verificación realizada y resultados

- Revisión de correspondencia entre responsables del README y AGENTS.md.
- Revisión de enlaces relativos, ausencia de secretos y diferenciación entre compilación local y deploy pendiente.
- El contenido de la aplicación no cambió por esta tarea; no corresponde repetir la compilación.

## Pendientes y coordinación con el otro integrante

- Ambos integrantes deben actualizar su copia desde GitHub antes de comenzar la siguiente tarea.
- Cada agente debe leer AGENTS.md al iniciar. Un archivo de instrucciones no garantiza que una herramienta lo lea automáticamente: entregar la referencia al agente de Fausto si no la detecta.
- Las próximas funcionalidades deben desarrollarse en ramas propias y con su registro incluido.
