/**
 * Shared badge colour helpers for all domain areas.
 * Functions instead of Record maps in components — avoid Tailwind class inference issues.
 */
import type { Prioridad, EstadoTarea } from './tareas';
import type { ResultadoLiquidacion } from './liquidaciones';
import type { EstadoSemaforo } from './semaforo';

type BadgeVariant = 'default' | 'secondary' | 'destructive' | 'outline';

// ─── Prioridad badge ────────────────────

const PRIORIDAD_BADGE_VARIANT: Record<Prioridad, BadgeVariant> = {
  ALTA: 'destructive',
  MEDIA: 'default',
  BAJA: 'secondary',
};

export function getPrioridadBadgeVariant(p: Prioridad): BadgeVariant {
  return PRIORIDAD_BADGE_VARIANT[p];
}

// ─── EstadoTarea badge ──────────────────

const ESTADO_BADGE_VARIANT: Record<EstadoTarea, BadgeVariant> = {
  PENDIENTE: 'outline',
  EN_PROCESO: 'default',
  COMPLETADA: 'secondary',
  CANCELADA: 'secondary',
};

export function getEstadoBadgeVariant(e: EstadoTarea): BadgeVariant {
  return ESTADO_BADGE_VARIANT[e];
}

// ─── ResultadoLiquidacion badge ─────────

export function getResultadoBadgeVariant(r: ResultadoLiquidacion): BadgeVariant {
  const map: Record<ResultadoLiquidacion, BadgeVariant> = {
    A_PAGAR: 'destructive',
    SALDO_A_FAVOR: 'secondary',
    SIN_MOVIMIENTO: 'outline',
  };
  return map[r];
}

// ─── EstadoSemaforo badge ───────────────

const SEMAFORO_BADGE_VARIANT: Record<EstadoSemaforo, BadgeVariant> = {
  VERDE: 'secondary',
  AMARILLO: 'default',
  ROJO: 'destructive',
};

export function getSemaforoBadgeVariant(s: EstadoSemaforo): BadgeVariant {
  return SEMAFORO_BADGE_VARIANT[s];
}

// ─── EmailTemplate tipo badge ───────────

const TIPO_TEMPLATE_BADGE_VARIANT: Record<string, BadgeVariant> = {
  VENCIMIENTO: 'destructive',
  LIQUIDACION: 'default',
  RECORDATORIO: 'default',
  GENERAL: 'outline',
};

export function getTipoTemplateBadgeVariant(t: string): BadgeVariant {
  return TIPO_TEMPLATE_BADGE_VARIANT[t] ?? 'secondary';
}
