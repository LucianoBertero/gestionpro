'use client';

import type { EstadoSemaforo } from '@/features/clientes/api/types';

const semaforoClasses: Record<string, string> = {
  VERDE: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-950 dark:text-green-300 dark:border-green-800',
  AMARILLO:
    'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800',
  ROJO: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-800',
};

const semaforoDot: Record<string, string> = {
  VERDE: 'bg-green-500',
  AMARILLO: 'bg-amber-500',
  ROJO: 'bg-red-500',
};

const semaforoLabels: Record<string, string> = {
  VERDE: 'Verde',
  AMARILLO: 'Amarillo',
  ROJO: 'Rojo',
};

interface SemaforoBadgeProps {
  value: EstadoSemaforo | string;
  className?: string;
}

function SemaforoBadge({ value, className = '' }: SemaforoBadgeProps) {
  const label = semaforoLabels[value] ?? value;
  const classes = semaforoClasses[value] ?? 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-950 dark:text-gray-300 dark:border-gray-800';
  const dot = semaforoDot[value] ?? 'bg-gray-500';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${classes} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
}

export { SemaforoBadge, semaforoLabels, semaforoClasses, semaforoDot };
