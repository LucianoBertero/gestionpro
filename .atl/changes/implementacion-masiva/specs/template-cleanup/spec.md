# Delta Spec: template-cleanup

## ADDED Requirements

| # | Requirement | MUST/SHALL | Scenarios (GIVEN→WHEN→THEN) |
|---|-------------|------------|----------------------------|
| 1 | El directorio `src/features/products/` DEBE ser eliminado | MUST | GIVEN existe folder products WHEN limpieza completa THEN folder no existe |
| 2 | El directorio `src/features/product/` (singular) DEBE ser eliminado | MUST | GIVEN existe folder product (singular) WHEN limpieza completa THEN no existe |
| 3 | La página `/about` DEBE ser eliminada | MUST | GIVEN existe route /about WHEN refactor THEN route no existe |
| 4 | La página `/privacy` DEBE ser eliminada | MUST | GIVEN existe route /privacy THEN no existe tras limpieza |
| 5 | La página `/terms` DEBE ser eliminada | MUST | GIVEN existe route /terms THEN no existe tras limpieza |
| 6 | El nav en `nav-config.ts` DEBE ocultar links a productos y otras páginas del template | MUST | GIVEN hay items de nav a products, about, privacy, terms WHEN nav se limpian THEN no aparecen en sidebar |
| 7 | Las páginas eliminadas DEBEN retornar 404 si se accede directamente | MUST | GIVEN usuario intenta acceder a /products directamente THEN muestra página 404 |

### Scenario: Verificar cleanup completo

- GIVEN se ejecutó limpieza
- WHEN `grep -r "products" src/features/` (sin resultados)
- AND `grep -r "about" src/app/` (sin resultados)
- THEN limpieza exitosa