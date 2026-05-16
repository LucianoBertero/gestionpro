# Delta Spec: i18n-global

## ADDED Requirements

| # | Requirement | MUST/SHALL | Scenarios (GIVEN→WHEN→THEN) |
|---|-------------|------------|----------------------------|
| 1 | El proyecto DEBE configurar i18next como solución de i18n | MUST | GIVEN proyecto limpia i18n WHEN se configura THEN package.json incluye i18next, react-i18next, i18next-browser-languagedetector |
| 2 | El locale `es-AR` DEBE ser el locale por defecto | MUST | GIVEN usuario accede a la app WHEN carga THEN idioma es español Argentina |
| 3 | El archivo `src/locales/es-AR/common.json` DEBE existir con traducciones de UI | MUST | GIVEN se requiere traducción WHEN se usa t('key') THEN busca en common.json |
| 4 | Todos los strings hardcodeados DEBEN migrarse a funciones t() | MUST | GIVEN componente muestra "Crear cliente" WHEN se migra THEN muestra t('common.createClient') |
| 5 | Los nuevos features DEBEN usar traducciones desde el inicio | MUST | GIVEN se crea nuevo feature WHEN implementa THEN usa t('key') para todo texto visible |
| 6 | El switcher de idioma DEBE permitir cambiar entre es-AR y en-US | MUST | GIVEN usuario hace click en selector de idioma WHEN cambia THEN UI actualiza immediately |
| 7 | Las traducciones DEBEN incluir: labels de tablas, botones, errores, mensajes toast, dates | MUST | GIVEN cualquier texto visible al usuario WHEN no hardcodeado THEN traducción existe en JSON |

### Scenario: Cambiar idioma

- GIVEN usuario en español
- WHEN cambia a inglés
- THEN toda la UI muestra labels en inglés sin reload

### Scenario: Translation missing

- GIVEN componente usa t('key.inexistente')
- THEN en desarrollo muestra "[missing key]" en consola; en producción muestra key como fallback

### Scenario: Formatos de fecha

- GIVEN usuario ve fecha en tabla
- WHEN locale es es-AR THEN muestra "16/05/2026"
- WHEN locale es en-US THEN muestra "05/16/2026"