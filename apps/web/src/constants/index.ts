/**
 * Shared constants for the GestiónPro frontend.
 * Import from here — never hardcode these values in feature code.
 */

// ─── Roles ───────────────────────────────────────────────────────────────

export const ROLES = ['SOCIO', 'COLABORADOR'] as const;
export type Rol = (typeof ROLES)[number];

export const SOCIO: Rol = 'SOCIO';
export const COLABORADOR: Rol = 'COLABORADOR';

// ─── Labels ───────────────────────────────────────────────────────────────

export const ROL_LABELS: Record<Rol, string> = {
  [SOCIO]: 'Socio',
  [COLABORADOR]: 'Colaborador',
};

export const ROL_BADGE_VARIANT: Record<Rol, 'default' | 'outline'> = {
  [SOCIO]: 'default',
  [COLABORADOR]: 'outline',
};

// ─── Domain constants re-exports ──────────────────────────────────────────

export {
  TIPO_IMPUESTO_VALUES,
  TIPO_IMPUESTO_LABELS,
  type TipoImpuesto,
} from './impuestos';

export {
  PRIORIDAD_VALUES,
  PRIORIDAD_LABELS,
  PRIORIDAD_DOT_CLASS,
  type Prioridad,
  ESTADO_TAREA_VALUES,
  ESTADO_TAREA_LABELS,
  type EstadoTarea,
  TIPO_TAREA_VALUES,
  TIPO_TAREA_LABELS,
  type TipoTarea,
  TIEMPO_EST_MIN_BUCKETS,
  type TiempoEstMinBucket,
} from './tareas';

export {
  RESULTADO_LIQUIDACION_VALUES,
  RESULTADO_LABELS,
  RESULTADO_BADGE_VARIANT,
  type ResultadoLiquidacion,
  type ResultadoBadgeVariant,
} from './liquidaciones';

export {
  SEMAFORO_VALUES,
  SEMAFORO_LABELS,
  type EstadoSemaforo,
} from './semaforo';

export {
  getPrioridadBadgeVariant,
  getEstadoBadgeVariant,
  getResultadoBadgeVariant,
  getSemaforoBadgeVariant,
  getTipoTemplateBadgeVariant,
} from './badges';

// ─── Shared utility constants ─────────────────────────────────────────────

export const NULL_PLACEHOLDER = '—' as const;

export const ACTIVO_LABEL = 'Activo' as const;
export const INACTIVO_LABEL = 'Inactivo' as const;
