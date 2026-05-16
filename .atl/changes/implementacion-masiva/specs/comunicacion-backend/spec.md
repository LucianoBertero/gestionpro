# Delta Spec: comunicacion-backend

## ADDED Requirements

| # | Requirement | MUST/SHALL | Scenarios (GIVEN→WHEN→THEN) |
|---|-------------|------------|----------------------------|
| 1 | El módulo Comunicación DEBE implementar CRUD completo de comunicaciones (llamadas, emails, reuniones) vinculadas a clientes | MUST | GIVEN un cliente existe en el sistema WHEN se crea una comunicación con tipo LLAMADA, EMAIL o REUNION THEN la comunicación se guarda con clienteId, tipo, fecha, notes y usuarioId |
| 2 | El endpoint GET /v1/comunicaciones DEBE permitir filtrar por clienteId | MUST | GIVEN hay comunicaciones en la base de datos WHEN se llama GET /v1/comunicaciones?clienteId=5 THEN se retornan solo las comunicaciones del cliente 5 |
| 3 | El endpoint GET /v1/comunicaciones DEBE permitir filtrar por tipo (LLAMADA, EMAIL, REUNION) | MUST | GIVEN hay comunicaciones de múltiples tipos WHEN se llama GET /v1/comunicaciones?tipo=EMAIL THEN se retornan solo las comunicaciones de tipo EMAIL |
| 4 | El endpoint GET /v1/comunicaciones DEBE soportar paginación con page y perPage | MUST | GIVEN hay más de 20 comunicaciones WHEN se llama GET /v1/comunicaciones?page=1&perPage=20 THEN retorna primera página con meta.total, meta.pagina |
| 5 | Los endpoints DEBEN aplicar filtros por usuarioId para COLABORADOR (solo sus comunicaciones) | MUST | GIVEN un usuario con rol COLABORADOR autenticado WHEN consulta GET /v1/comunicaciones THEN retorna solo comunicaciones donde usuarioId es el actual |
| 6 | Los endpoints DEBEN requerir JwtAuthGuard | MUST | GIVEN una request sin token JWT WHEN se llama cualquier endpoint de comunicación THEN retorna 401 Unauthorized |

### Scenario: Crear comunicación exitosa

- GIVEN un cliente existe y usuario autenticado tiene rol SOCIO o COLABORADOR
- WHEN POST /v1/comunicaciones con payload { clienteId, tipo, fecha, notes }
- THEN retorna 201 con { data: { id, clienteId, tipo, fecha, notes, usuarioId, createdAt } }

### Scenario: Filtrar comunicaciones por cliente y tipo

- GIVEN existe clienteId=3 con 5 llamadas y 2 emails
- WHEN GET /v1/comunicaciones?clienteId=3&tipo=LLAMADA
- THEN retorna array con 5 objetos tipo LLAMADA

### Scenario: Error al crear comunicación con cliente inexistente

- GIVEN clienteId=999 no existe en la base de datos
- WHEN POST /v1/comunicaciones con { clienteId: 999, tipo: 'EMAIL' }
- THEN retorna 404 con error CLIENTE_NO_ENCONTRADO