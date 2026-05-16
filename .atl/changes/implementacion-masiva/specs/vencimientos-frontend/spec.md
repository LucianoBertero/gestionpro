# Delta Spec: vencimientos-frontend

## ADDED Requirements

| # | Requirement | MUST/SHALL | Scenarios (GIVEN→WHEN→THEN) |
|---|-------------|------------|----------------------------|
| 1 | La página /dashboard/vencimientos DEBE mostrar tabla de vencimientos con columnas: Cliente, Impuesto, Período, Fecha Vencimiento, Estado | MUST | GIVEN hay vencimientos en el sistema WHEN usuario accede a /dashboard/vencimientos THEN renderiza DataTable con esas columnas |
| 2 | La tabla DEBE soportar paginación, ordenamiento por fecha y filtrado por estado | MUST | GIVEN más de 20 vencimientos WHEN usuario cambia página THEN carga página correspondiente |
| 3 | Solo usuarios con rol SOCIO DEBEN ver opción de carga masiva Excel | MUST | GIVEN usuario COLABORADOR autenticado WHEN accede a /dashboard/venimientos THEN no muestra botón "Importar Excel" |
| 4 | El botón "Importar Excel" DEBE abrir modal para subir archivo .xlsx | MUST | GIVEN usuario SOCIO hace click en Importar Excel WHEN modal abre THEN permite drag & drop o selección de archivo |
| 5 | El parsing del Excel DEBE validar estructura: CUIT, Impuesto, Período, Fecha Vencimiento | MUST | GIVEN usuario sube archivo Excel WHEN proceso inicia THEN valida columnas requeridas |
| 6 | El parsing DEBE crear vencimientos válidos; los inválidos DEBEN reportarse en resumen | MUST | GIVEN Excel tiene 10 filas, 2 con CUIT inválido WHEN procesa THEN crea 8 vencimientos y muestra errores de 2 filas |
| 7 | Los estados de vencimiento DEBEN ser: PENDIENTE, VENCIDO, PAGADO, CANCELADO | MUST | GIVEN usuario ve tabla de vencimientos WHEN renderiza THEN muestra badges con esos estados |

### Scenario: Carga masiva exitosa

- GIVEN archivo Excel con 50 rows válidos
- WHEN usuario sube archivo y confirma
- THEN muestra toast "50 vencimientos importados correctamente"

### Scenario: Carga masiva con errores

- GIVEN archivo Excel con CUIT inexistente en row 3
- WHEN procesa archivo
- THEN muestra resumen "49 importados, 1 error: CUIT 20-12345678-3 no existe"