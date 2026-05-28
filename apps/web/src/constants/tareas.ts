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
