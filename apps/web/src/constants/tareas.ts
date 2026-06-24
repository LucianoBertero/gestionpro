/**
 * Tareas domain constants: Prioridad + EstadoTarea + TipoTarea.
 * Import from here — single source of truth.
 */

// ─── Prioridad ───────────────────────────

export const PRIORIDAD_VALUES = ['ALTA', 'MEDIA', 'BAJA'] as const;
export type Prioridad = (typeof PRIORIDAD_VALUES)[number];

export const PRIORIDAD_LABELS: Record<Prioridad, string> = {
  ALTA: 'Alta',
  MEDIA: 'Media',
  BAJA: 'Baja',
};

/** Tailwind class for the priority indicator dot. */
export const PRIORIDAD_DOT_CLASS: Record<Prioridad, string> = {
  ALTA: 'bg-destructive',
  MEDIA: 'bg-amber-500',
  BAJA: 'bg-muted-foreground/40',
};

// ─── EstadoTarea ─────────────────────────

export const ESTADO_TAREA_VALUES = [
  'PENDIENTE',
  'EN_PROCESO',
  'COMPLETADA',
  'CANCELADA',
] as const;

export type EstadoTarea = (typeof ESTADO_TAREA_VALUES)[number];

export const ESTADO_TAREA_LABELS: Record<EstadoTarea, string> = {
  PENDIENTE: 'Pendiente',
  EN_PROCESO: 'En progreso',
  COMPLETADA: 'Completada',
  CANCELADA: 'Cancelada',
};

// ─── TipoTarea ─────────────────────────

export const TIPO_TAREA_VALUES = [
  'DDJJ',
  'VEP',
  'INTERNA',
  'BALANCE',
  'OTRO',
] as const;

export type TipoTarea = (typeof TIPO_TAREA_VALUES)[number];

export const TIPO_TAREA_LABELS: Record<TipoTarea, string> = {
  DDJJ: 'DDJJ',
  VEP: 'VEP',
  INTERNA: 'Interna',
  BALANCE: 'Balance',
  OTRO: 'Otro',
};

// ─── TiempoEstimado buckets ────────────

export const TIEMPO_EST_MIN_BUCKETS = [
  { value: '15', label: '15min' },
  { value: '30', label: '30min' },
  { value: '45', label: '45min' },
  { value: '60', label: '1h' },
  { value: '90', label: '1h 30m' },
  { value: '120', label: '2h' },
  { value: '180', label: '3h' },
  { value: '240', label: '4h' },
] as const;

export type TiempoEstMinBucket = (typeof TIEMPO_EST_MIN_BUCKETS)[number]['value'];
