# Delta Spec: archivo-frontend

## ADDED Requirements

| # | Requirement | MUST/SHALL | Scenarios (GIVEN→WHEN→THEN) |
|---|-------------|------------|----------------------------|
| 1 | La página /dashboard/archivos DEBE mostrar tabla con columnas: Nombre, Tipo, Tamaño, Cliente, Fecha, Acciones | MUST | GIVEN hay archivos en el sistema WHEN usuario accede THEN DataTable muestra esas columnas |
| 2 | El botón "Subir Archivo" DEBE abrir modal con drag & drop o input file | MUST | GIVEN usuario hace click WHEN modal abre THEN permite seleccionar archivo local |
| 3 | El upload DEBE validar tipo de archivo (pdf, xlsx, docx, jpg, png) | MUST | GIVEN usuario selecciona archivo .exe WHEN confirma THEN muestra error "Tipo de archivo no permitido" |
| 4 | El upload DEBE mostrar progreso de carga | MUST | GIVEN archivo grande (>5MB) WHEN sube THEN muestra barra de progreso |
| 5 | El botón download DEBE iniciar descarga del archivo | MUST | GIVEN usuario hace click en download WHEN inicia THEN navegador descarga archivo |
| 6 | La eliminación DEBE confirmar antes de borrar registro | MUST | GIVEN usuario hace click en eliminar archivo WHEN confirma THEN elimina metadata (no archivo físico) |
| 7 | Los filtros DEBEN permitir buscar por nombre de archivo y filtrar por cliente | MUST | GIVEN usuario escribe "factura" en búsqueda THEN muestra archivos con "factura" en nombre |

### Scenario: Upload exitoso

- GIVEN usuario selecciona "test.pdf" (1MB)
- WHEN completa metadata { cliente: "Acme", descripcion: "Factura" }
- THEN muestra toast "Archivo subido correctamente" y tabla muestra nuevo registro

### Scenario: Upload archivo muy grande

- GIVEN usuario selecciona archivo de 50MB
- WHEN intenta subir
- THEN muestra error "El archivo excede el límite de 25MB"