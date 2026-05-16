# Delta Spec: comunicacion-frontend

## ADDED Requirements

| # | Requirement | MUST/SHALL | Scenarios (GIVEN→WHEN→THEN) |
|---|-------------|------------|----------------------------|
| 1 | La página /dashboard/comunicaciones DEBE mostrar tabla CRUD con columnas: Cliente, Tipo, Fecha, Notes, Usuario | MUST | GIVEN hay comunicaciones en el sistema WHEN usuario accede THEN DataTable muestra esas columnas |
| 2 | La tabla DEBE permitir filtrar por cliente (dropdown) y por tipo (LLAMADA, EMAIL, REUNION) | MUST | GIVEN usuario aplica filtro cliente=3 AND tipo=EMAIL THEN muestra solo esas comunicaciones |
| 3 | El botón "Nueva Comunicación" DEBE abrir modal para crear comunicación | MUST | GIVEN usuario hace click WHEN modal abre THEN formulario con cliente (dropdown), tipo, fecha, notes |
| 4 | La edición DEBE permitir modificar notes y fecha de comunicación existente | MUST | GIVEN comunicación existente WHEN usuario hace click en editar THEN permite modificar esos campos |
| 5 | La eliminación DEBE confirmar antes de borrar | MUST | GIVEN usuario hace click en eliminar WHEN confirma THEN elimina; Cancelar no hace nada |
| 6 | La paginación DEBE soportar page y perPage con datos del backend | MUST | GIVEN más de 20 comunicaciones WHEN usuario cambia página THEN carga datos de esa página |
| 7 | COLABORADOR solo DEBE ver sus propias comunicaciones | MUST | GIVEN COLABORADOR con usuarioId=5 WHEN carga página THEN muestra solo comunicaciones donde usuarioId=5 |

### Scenario: Crear comunicación desde tabla

- GIVEN usuario hace click en Nueva Comunicación
- WHEN completa { cliente: "Acme SA", tipo: "REUNION", fecha: "2026-05-20", notes: "Reunión de cierre" }
- THEN guarda y tabla muestra nuevo registro

### Scenario: Editar comunicación

- GIVEN comunicación con notes "Notas antiguas"
- WHEN usuario edita y cambia a "Notas actualizadas"
- THEN tabla muestra texto actualizado