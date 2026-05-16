# Delta Spec: agenda-frontend

## ADDED Requirements

| # | Requirement | MUST/SHALL | Scenarios (GIVEN→WHEN→THEN) |
|---|-------------|------------|----------------------------|
| 1 | La página /dashboard/agenda DEBE renderizar FullCalendar con vista mensual y semanal | MUST | GIVEN usuario autenticado accede a /dashboard/agenda WHEN la página carga THEN muestra componente FullCalendar con controles para cambiar vista |
| 2 | La vista DEBE mostrar eventos del calendario importando datos del endpoint GET /v1/agenda-items | MUST | GIVEN existen agenda items en la base de datos WHEN se renderiza el calendario THEN muestra eventos en las fechas correspondientes |
| 3 | El usuario DEBE poder crear eventos mediante click en fecha del calendario | MUST | GIVEN usuario hace click en fecha vacía WHEN modal de crear evento abre THEN permite ingresar titulo, descripcion, tipo, fecha inicio, fecha fin |
| 4 | El usuario DEBE poder editar eventos existentes mediante drag & drop | MUST | GIVEN existe un evento en el calendario WHEN usuario arrastra el evento THEN actualiza fechaInicio/fechaFin en backend |
| 5 | El usuario DEBE poder eliminar eventos | MUST | GIVEN existe evento en el calendario WHEN usuario hace click en eliminar THEN confirma y elimina el evento |
| 6 | Los filtros DEBEN permitir mostrar por tipo (REUNION, LLAMADA, RECORDATORIO, PERSONAL) | MUST | GIVEN hay eventos de múltiples tipos WHEN usuario filtra por tipo=REUNION THEN muestra solo reuniones |
| 7 | El componente DEBE mostrar correctamente timezone America/Argentina/Buenos_Aires | MUST | GIVEN usuario en Argentina WHEN crea evento 14:00 THEN se almacena en UTC y muestra 14:00 hora local |
| 8 | COLABORADOR solo DEBE ver sus propios eventos | MUST | GIVEN usuario COLABORADOR autenticado WHEN carga agenda THEN muestra solo eventos donde usuarioId coincide |