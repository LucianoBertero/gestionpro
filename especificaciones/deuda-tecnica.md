# Deuda Técnica — GestiónPro

> **Documento vivo · Última actualización: Mayo 2026**
> Registrar acá todo lo que se posterga por prioridad, tiempo o complejidad.

---

## 1. Validación de CUIT con Dígito Verificador

**Módulo**: Clientes (backend + frontend)  
**Prioridad**: Media  
**Complejidad**: Media  
**Estado**: ⬜ Pendiente

### Descripción
La validación actual de CUIT solo verifica que sean 11 dígitos numéricos. No implementa el algoritmo de módulo 11 con dígito verificador que usa AFIP.

### Implementación actual
```typescript
// apps/api/src/common/utils/cuit.utils.ts
export function isValidCuit(cuit: string): boolean {
  const cleaned = cleanCuit(cuit);
  return cleaned.length === 11 && /^\d{11}$/.test(cleaned);
}
```

### Lo que falta
- Algoritmo de módulo 11 con factores `[5, 4, 3, 2, 7, 6, 5, 4, 3, 2]`
- Validación de prefijos válidos (20/23/24/27 para personas físicas, 30/33/34 para jurídicas)
- Aplicar misma lógica en frontend (`apps/web/src/lib/utils/cuit.ts`)

### Impacto
Actualmente acepta CUITs inválidos como `11-11111111-1`. Para MVP funcional es aceptable, pero antes de producción real debe implementarse.

---

## 2. Integración Real con AFIP Padrón

**Módulo**: Clientes (backend)  
**Prioridad**: Baja  
**Complejidad**: Alta  
**Estado**: ⬜ Pendiente

### Descripción
El endpoint `GET /v1/clientes/afip/:cuit` usa datos mock hardcodeados (6 CUITs de ejemplo). No hay integración real con la API pública de AFIP.

### Implementación actual
```typescript
// apps/api/src/modules/clientes/services/afip.service.ts
const AFIP_MOCK_DATA = {
  '20-12345678-9': { cuit: '20-12345678-9', denominacion: 'GARCÍA JUAN', ... },
  // ... 5 registros más
};
```

### Lo que falta
- Integración con API real de AFIP (padrón A5 o similar)
- Manejo de rate limiting y timeouts
- Cache de consultas (Redis, TTL 24h)
- Fallback graceful si AFIP está caído
- Logging de consultas externas

### Impacto
El autocompletado de datos por CUIT no funciona con datos reales. Para MVP es aceptable (carga manual), pero mejora mucho la UX.

---

## 3. Cálculo Automático de Semáforo

**Módulo**: Clientes (backend)  
**Prioridad**: Media  
**Complejidad**: Media  
**Estado**: ⬜ Pendiente

### Descripción
El método `calcularSemaforo(clienteId)` existe en `ClientesService` pero nunca se ejecuta. El semáforo solo se cambia manualmente desde la tabla.

### Implementación actual
```typescript
// apps/api/src/modules/clientes/services/clientes.service.ts
async calcularSemaforo(clienteId: number): Promise<EstadoSemaforo> {
  // Lógica: busca tareas PENDIENTES, verifica vencimientos
  // NUNCA ES LLAMADO
}
```

### Lo que falta
- Cron job diario que recalcule semáforos de todos los clientes activos
- Trigger al completar tarea: recalcular semáforo del cliente
- Trigger al cargar liquidación: recalcular semáforo del cliente
- Endpoint manual `POST /clientes/:id/recalcular-semaforo` para forzar cálculo

### Impacto
El semáforo no refleja el estado real del cliente (tareas vencidas, liquidaciones faltantes). Para MVP se maneja manual, pero pierde valor como indicador.

---

## 4. Filtro de COLABORADOR (Ver Solo Sus Clientes)

**Módulo**: Clientes (backend)  
**Prioridad**: Alta  
**Complejidad**: Baja  
**Estado**: ⬜ Pendiente

### Descripción
El código para filtrar clientes por `encargadoId` del usuario COLABORADOR existe pero está comentado con "MVP mode: sin restricciones de rol". Actualmente un COLABORADOR ve TODOS los clientes.

### Implementación actual
```typescript
// apps/api/src/modules/clientes/services/clientes.service.ts
private applyCollaboradorFilter(options: any, user: IAuthUser): void {
  // if (user.role === UserRole.COLABORADOR) {
  //   options.encargadoId = user.userId;
  // }
  // MVP mode: sin restricciones de rol
}
```

### Lo que falta
- Descomentar lógica de filtro en `applyCollaboradorFilter()`
- Descomentar validación de acceso en `assertCollaboradorAccess()`
- Testing con usuarios de ambos roles

### Impacto
Problema de seguridad/privacidad: colaboradores ven clientes que no les corresponden. Para MVP con equipo chico es aceptable, pero debe activarse antes de escalar.

---

## 5. Paginación Real en Listado de Clientes

**Módulo**: Clientes (frontend)  
**Prioridad**: Baja  
**Complejidad**: Baja  
**Estado**: ⬜ Pendiente

### Descripción
El frontend hardcodea `skip: 0, take: 1000` en todas las consultas. No hay paginación server-side real.

### Implementación actual
```typescript
// apps/web/src/features/clientes/api/service.ts
export async function getClientes(filters: ClienteFilters) {
  const { data } = await api.get('/v1/clientes', {
    params: { ...filters, skip: 0, take: 1000 }  // Hardcodeado
  });
  return data;
}
```

### Lo que falta
- Usar `page` y `perPage` de `ClienteFilters` para calcular `skip` y `take`
- Actualizar tabla para usar `meta.total` y `meta.pageCount` del backend
- Manejar caso de lista vacía correctamente

### Impacto
Con 50-150 clientes no hay problema de performance. Si la cartera crece a 500+, va a impactar tiempos de carga.

---

## 6. Tipo de Persona (Física/Jurídica)

**Módulo**: Clientes (schema + backend + frontend)  
**Prioridad**: Media  
**Complejidad**: Media  
**Estado**: ⬜ Pendiente

### Descripción
No hay campo que distinga persona física de jurídica. Esto afecta validaciones de CUIT (prefijos 20/27 vs 30/33/34) y campos requeridos (razón social vs nombre).

### Lo que falta
- Campo `tipoPersona: enum { FISICA, JURIDICA }` en schema
- Validación de prefijo CUIT según tipo
- Campos condicionales en formulario (razón social para jurídicas)
- Migración de datos existentes (inferir desde prefijo CUIT)

---

## 7. Categoría de Monotributo

**Módulo**: Clientes (schema + backend + frontend)  
**Prioridad**: Media  
**Complejidad**: Baja  
**Estado**: ⬜ Pendiente

### Descripción
Para clientes monotributistas no hay campo para registrar la categoría (A, B, C, D, E, F, G, H, I, J, K). Es información esencial para liquidaciones.

### Lo que falta
- Campo `categoriaMonotributo: String?` en schema
- Dropdown en formulario (solo visible si `MONOTRIBUTO` está en impuestos)
- Validación: solo A-K válidos

---

## 8. Domicilio Estructurado

**Módulo**: Clientes (schema + backend + frontend)  
**Prioridad**: Baja  
**Complejidad**: Media  
**Estado**: ⬜ Pendiente

### Descripción
Actualmente hay un solo campo `domicilio` de texto libre. Para un estudio contable sería útil tener domicilio fiscal estructurado (calle, número, piso, depto, localidad, provincia, CP).

### Lo que falta
- Reemplazar `domicilio: String?` por campos estructurados:
  - `domicilioCalle`, `domicilioNumero`, `domicilioPiso?`, `domicilioDepto?`
  - `domicilioLocalidad`, `domicilioProvincia`, `domicilioCP`
- Opcional: segundo domicilio (comercial) con mismos campos
- Migración de datos existentes (parsear texto libre)
- Actualizar formulario con campos estructurados

---

## 9. Fecha de Ingreso y Baja del Cliente

**Módulo**: Clientes (schema + backend + frontend)  
**Prioridad**: Baja  
**Complejidad**: Baja  
**Estado**: ⬜ Pendiente

### Descripción
No hay campos para registrar cuándo el cliente ingresó al estudio ni cuándo se dio de baja (si aplica). Útil para métricas de crecimiento de cartera.

### Lo que falta
- Campo `fechaIngreso: DateTime @default(now())` en schema
- Campo `fechaBaja: DateTime?` en schema
- Al hacer soft-delete (`activo: false`), setear `fechaBaja` automáticamente
- Mostrar en legajo del cliente
- Incluir en reportes de panel financiero

---

## 10. CBU/Alias para Cobro de Honorarios

**Módulo**: Clientes (schema + backend + frontend)  
**Prioridad**: Baja  
**Complejidad**: Baja  
**Estado**: ⬜ Pendiente

### Descripción
No hay campos para registrar datos bancarios del cliente para cobro de honorarios (CBU, alias, banco, forma de pago preferida).

### Lo que falta
- Campos `cbu: String?`, `aliasBancario: String?`, `banco: String?`
- Campo `formaPagoPreferida: String?` (transferencia, efectivo, cheque, etc.)
- Sección en formulario de "Datos de Pago"
- Mostrar en legajo solo para SOCIO (dato sensible)

---

## 11. Honorario Mensual en DTOs y Formulario

**Módulo**: Clientes (backend + frontend)  
**Prioridad**: Baja  
**Complejidad**: Baja  
**Estado**: ⬜ Pendiente

### Descripción
El campo `honorarioMensual` existe en el schema Prisma pero no está expuesto en ningún DTO ni en el formulario. Es un campo muerto.

### Lo que falta
- Agregar `honorarioMensual` a `ClienteResponseDto` con `@Expose()`
- Agregar a `CreateClienteDto` y `UpdateClienteDto` con validación `@IsNumber @IsOptional @Min(0)`
- Agregar campo numérico en formulario
- Mostrar en legajo y tabla (solo SOCIO)

---

## 12. Supervisor en Formulario

**Módulo**: Clientes (frontend)  
**Prioridad**: Baja  
**Complejidad**: Baja  
**Estado**: ⬜ Pendiente

### Descripción
El campo `supervisorId` existe en backend (schema + DTOs) pero no está en el formulario de alta/edición.

### Lo que falta
- Agregar dropdown de supervisor en formulario (similar a encargado)
- Solo usuarios con rol SOCIO pueden ser supervisores
- Mostrar supervisor asignado en legajo

---

## 13. Actividades en Formulario

**Módulo**: Clientes (frontend)  
**Prioridad**: Baja  
**Complejidad**: Media  
**Estado**: ⬜ Pendiente

### Descripción
El campo `actividades: String[]` existe en backend pero no está en el formulario. Es un array de strings con actividades AFIP del cliente.

### Lo que falta
- Campo de tags/chips en formulario para agregar/quitar actividades
- Opcional: autocomplete con catálogo de actividades AFIP
- Mostrar actividades en legajo (ya se muestra en ResumenTab)

---

## 14. Bug: `buscarAfip` Frontend Destructuración Incorrecta

**Módulo**: Clientes (frontend)  
**Prioridad**: Baja  
**Complejidad**: Baja  
**Estado**: ⬜ Pendiente

### Descripción
La función `buscarAfip()` en `apps/web/src/features/clientes/api/service.ts` espera `data.data` pero el endpoint devuelve el valor directo (sin `serialization` en controller).

### Implementación actual
```typescript
export async function buscarAfip(cuit: string): Promise<AfipResponse> {
  const { data } = await api.get(`/v1/clientes/afip/${cuit}`);
  return data.data;  // BUG: data.data es undefined
}
```

### Fix
```typescript
export async function buscarAfip(cuit: string): Promise<AfipResponse> {
  const { data } = await api.get(`/v1/clientes/afip/${cuit}`);
  return data;  // El endpoint devuelve directo
}
```

### Impacto
El autocompletado desde AFIP no funciona. Como AFIP es mock, no es crítico para MVP.

---

## 15. Bug: `findAll()` sin Serialization en Controller

**Módulo**: Clientes (backend)  
**Prioridad**: Media  
**Complejidad**: Baja  
**Estado**: ⬜ Pendiente

### Descripción
El endpoint `GET /v1/clientes` no tiene `serialization` en `@ApiEndpoint`, por lo que el `ResponseInterceptor` no aplica `plainToInstance` con `excludeExtraneousValues`.

### Implementación actual
```typescript
@Get()
@ApiEndpoint({ summary: 'List clients', messageKey: 'clientes.success.list' })
// Falta: serialization: ClienteResponseDto
async findAll(...) { ... }
```

### Fix
```typescript
@Get()
@ApiEndpoint({ 
  summary: 'List clients', 
  serialization: ClienteResponseDto,
  paginated: true,
  messageKey: 'clientes.success.list' 
})
async findAll(...) { ... }
```

### Impacto
El response puede incluir campos no expuestos o tener formato incorrecto. Para MVP funciona pero no sigue el patrón del resto de endpoints.

---

## Priorización Recomendada

### Antes de Producción (Alta Prioridad)
1. **Filtro COLABORADOR** (#4) — seguridad/privacidad
2. **Validación CUIT con dígito verificador** (#1) — integridad de datos
3. **Cálculo automático de semáforo** (#3) — valor del indicador

### Post-MVP (Media Prioridad)
4. **Integración AFIP real** (#2) — mejora UX
5. **Tipo de persona** (#6) — validaciones correctas
6. **Categoría Monotributo** (#7) — dato esencial para monotributistas

### Mejoras Futuras (Baja Prioridad)
7. **Paginación real** (#5) — performance con muchos clientes
8. **Domicilio estructurado** (#8) — mejor organización
9. **Fecha ingreso/baja** (#9) — métricas de cartera
10. **CBU/Alias** (#10) — datos de pago
11. **Honorario mensual** (#11) — completar campo existente
12. **Supervisor en form** (#12) — completar campo existente
13. **Actividades en form** (#13) — completar campo existente
14. **Bug buscarAfip** (#14) — fix simple
15. **Bug serialization** (#15) — fix simple

---

*Documento vivo · Actualizar con cada deuda resuelta o nueva identificada*
