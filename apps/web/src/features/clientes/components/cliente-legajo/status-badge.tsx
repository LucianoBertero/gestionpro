'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import {
  ESTADO_IMPUESTO_LABELS,
  type EstadoImpuesto,
} from '../../api/types-impuestos-estado';

interface StatusBadgeProps {
  estado: EstadoImpuesto;
  className?: string;
}

const ESTADO_CLASSES: Record<EstadoImpuesto, string> = {
  A_PRESENTAR:
    'border-transparent bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300',
  PRESENTADO:
    'border-transparent bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300',
  VENCIDO:
    'border-transparent bg-red-100 text-red-800 dark:bg-red-950/40 dark:text-red-300',
};

export function StatusBadge({ estado, className }: StatusBadgeProps) {
  return (
    <Badge variant='outline' className={cn(ESTADO_CLASSES[estado], className)}>
      {ESTADO_IMPUESTO_LABELS[estado]}
    </Badge>
  );
}
