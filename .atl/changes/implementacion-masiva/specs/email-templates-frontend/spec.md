# Delta Spec: email-templates-frontend

## ADDED Requirements

| # | Requirement | MUST/SHALL | Scenarios (GIVEN→WHEN→THEN) |
|---|-------------|------------|----------------------------|
| 1 | Solo usuarios con rol SOCIO DEBEN acceder a /dashboard/email-templates | MUST | GIVEN usuario COLABORADOR intenta acceder a /dashboard/email-templates THEN redirect a /dashboard con error 403 |
| 2 | La página DEBE listar templates en tabla con columnas: Nombre, Tipo, Asunto,Última modificación | MUST | GIVEN hay templates en el sistema WHEN SOCIO accede THEN muestra DataTable con esas columnas |
| 3 | El botón "Nuevo Template" DEBE abrir editor con campos: nombre, tipo, asunto, cuerpo | MUST | GIVEN usuario hace click en Nuevo Template WHEN editor abre THEN muestra formulario con esos campos |
| 4 | El editor DEBE soportar preview en vivo del template | MUST | GIVEN usuario escribe cuerpo con variables WHEN hace click en Preview THEN muestra rendered preview con variables reemplazadas |
| 5 | Las variables DEBEN incluir: {{cliente.nombre}}, {{cliente.cuit}}, {{periodo}}, {{vencimiento.fecha}}, {{usuario.nombre}} | MUST | GIVEN usuario inserta {{cliente.nombre}} en el cuerpo WHEN Preview THEN muestra "Juan Pérez" |
| 6 | Los tipos de template DEBEN ser: BIENVENIDA, RECORDATORIO_VENCIMIENTO, LIQUIDACION, NOTIFICACION | MUST | GIVEN usuario crea template WHEN selecciona tipo THEN guarda con ese tipo |
| 7 | La edición DEBE permitir guardar cambios o cancelar | MUST | GIVEN usuario modifica template WHEN hace click en Guardar THEN persiste cambios; Cancelar descarta |

### Scenario: Preview con todas las variables

- GIVEN template con cuerpo "Estimado {{cliente.nombre}}, su período {{periodo}} vence el {{vencimiento.fecha}}"
- AND cliente=Juan Pérez, periodo=2026-05, fecha=20/05/2026
- WHEN usuario hace Preview
- THEN muestra "Estimado Juan Pérez, su período 2026-05 vence el 20/05/2026"

### Scenario: Editar template existente

- GIVEN existe template con id=3
- WHEN usuario hace click en editar
- THEN carga datos existentes en editor para modificar