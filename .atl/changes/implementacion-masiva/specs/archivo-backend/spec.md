# Delta Spec: archivo-backend

## ADDED Requirements

| # | Requirement | MUST/SHALL | Scenarios (GIVEN→WHEN→THEN) |
|---|-------------|------------|----------------------------|
| 1 | El módulo Archivo DEBE implementar CRUD de metadatos de archivos vinculados a clientes o tareas | MUST | GIVEN un cliente existe WHEN se guarda un archivo con nombre, tipo, size, path THEN el archivo se relaciona con clienteId |
| 2 | El endpoint POST /v1/archivos DEBE recibir metadata del archivo (nombre, tipo, size, url) | MUST | GIVEN usuario autenticado WHEN POST /v1/archivos con { nombre, tipo, size, url, clienteId, tareaId? } THEN guarda metadatos y retorna 201 |
| 3 | El endpoint GET /v1/archivos DEBE listar archivos con filtros por clienteId y opcionalmente tareaId | MUST | GIVEN hay archivos vinculados a cliente 2 WHEN GET /v1/archivos?clienteId=2 THEN retorna lista de archivos del cliente |
| 4 | El endpoint GET /v1/archivos/:id DEBE retornar metadatos de un archivo específico | MUST | GIVEN existe archivo con id=7 WHEN GET /v1/archivos/7 THEN retorna { data: { id, nombre, tipo, size, url, clienteId, createdAt } } |
| 5 | El endpoint DELETE /v1/archivos/:id DEBE eliminar el registro de metadata (no el archivo físico) | MUST | GIVEN existe archivo con id=5 WHEN DELETE /v1/archivos/5 THEN retorna 204 y elimina el registro |
| 6 | Los endpoints DEBEN requerir JwtAuthGuard | MUST | GIVEN request sin token WHEN llama cualquier endpoint THEN retorna 401 |
| 7 | COLABORADOR solo DEBE ver archivos de clientes asignados | MUST | GIVEN usuario COLABORADOR con clientes asignados [1,2] WHEN GET /v1/archivos THEN retorna solo archivos de esos clientes |