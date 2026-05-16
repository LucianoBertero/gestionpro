# Delta Spec: notificaciones-frontend

## ADDED Requirements

| # | Requirement | MUST/SHALL | Scenarios (GIVEN→WHEN→THEN) |
|---|-------------|------------|----------------------------|
| 1 | El header DEBE mostrar icono de campanita en la barra de navegación | MUST | GIVEN usuario autenticado WHEN carga cualquier página del dashboard THEN muestra icono campana en header |
| 2 | La campanita DEBE mostrar badge rojo con número de notificaciones no leídas | MUST | GIVEN usuario tiene 5 notificaciones sin leer WHEN renderiza header THEN badge muestra "5" |
| 3 | Al hacer click en campanita DEBE abrir dropdown con lista de últimas 5 notificaciones | MUST | GIVEN usuario hace click en campanita WHEN dropdown abre THEN muestra lista de notificaciones con título, mensaje, fecha relativa |
| 4 | Click en notificación del dropdown DEBE marcarla como leída y navegar si tiene url | MUST | GIVEN notificación no leída con url=/dashboard/clientes/3 WHEN usuario hace click THEN marca como leída y navega a esa ruta |
| 5 | La página /dashboard/notificaciones DEBE mostrar historial completo con paginación | MUST | GIVEN hay más de 20 notificaciones WHEN usuario accede THEN muestra DataTable paginada |
| 6 | La tabla DEBE permitir filtrar por tipo (TAREA, VENCIMIENTO, SISTEMA) y por leída/no leída | MUST | GIVEN usuario aplica filtro tipo=VENCIMIENTO AND leida=false THEN muestra solo vencimientos pendientes |
| 7 | Botón "Marcar todas como leídas" DEBE estar disponible | MUST | GIVEN hay notificaciones sin leer WHEN usuario hace click en marcar todas THEN actualiza todas a leídas |

### Scenario: Nueva notificación arrive

- GIVEN se crea una tarea para el usuario
- WHEN polling o SSE detecta nueva notificación
- THEN badge incrementa en 1 y toast muestra "Nueva notificación: Nueva tarea asignada"

### Scenario: Dropdown vacío

- GIVEN usuario no tiene notificaciones
- WHEN hace click en campanita
- THEN dropdown muestra mensaje "No hay notificaciones"