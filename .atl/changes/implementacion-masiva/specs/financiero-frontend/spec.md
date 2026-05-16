# Delta Spec: financiero-frontend

## ADDED Requirements

| # | Requirement | MUST/SHALL | Scenarios (GIVEN→WHEN→THEN) |
|---|-------------|------------|----------------------------|
| 1 | La página /dashboard/financiero DEBE tener 3 secciones: Honorarios, Rentabilidad, Proyección | MUST | GIVEN usuario autenticado WHEN accede a /dashboard/financiero THEN renderiza tabs o secciones con esos 3 contenidos |
| 2 | Sección Honorarios DEBE mostrar gráfico de barras con ingresos por mes (últimos 12 meses) | MUST | GIVEN hay liquidaciones en el sistema WHEN usuario ve sección Honorarios THEN gráfico Recharts muestra barras por mes |
| 3 | Sección Honorarios DEBE mostrar tabla con total facturado, pendiente de cobro, cobranza realizada | MUST | GIVEN usuario ve sección WHEN renderiza THEN muestra esos 3 KPIs con valores |
| 4 | Sección Rentabilidad DEBE mostrar gráfico de línea de margen por cliente | MUST | GIVEN hay datos de rentabilidad WHEN usuario selecciona sección THEN muestra línea con margen por cliente |
| 5 | Sección Rentabilidad DEBE permitir filtrar por período (mensual, trimestral, anual) | MUST | GIVEN usuario selecciona filtro trimestral WHEN renderiza THEN agrupa datos por trimestre |
| 6 | Sección Proyección DEBE mostrar gráfico de área con ingresos proyectados vs real | MUST | GIVEN mes actual es mayo 2026 WHEN usuario ve Proyección THEN gráfica muestrareal hasta mayo y proyectadojun-dic |
| 7 | La proyección DEBE usar datos históricos para calcular tendencia | MUST | GIVEN hay datos de 12 meses anteriores WHEN calcula proyección THEN aplica media móvil o regresión lineal |

### Scenario: Cambiar período en Rentabilidad

- GIVEN usuario ve rentabilidad mensual
- WHEN cambia a Trimestral
- THEN gráfico agrupa por Q1 (ene-mar), Q2 (abr-jun), etc.

### Scenario: Sin datos para gráfico

- GIVEN no hay liquidaciones en el sistema
- WHEN usuario accede a Financiero
- THEN muestra mensaje "No hay datos suficientes para mostrar gráficos"