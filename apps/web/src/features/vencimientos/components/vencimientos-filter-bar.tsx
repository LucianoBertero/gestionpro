'use client';

import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Icons } from '@/components/icons';
import { useT } from '@/lib/i18n/client';
import { TIPO_IMPUESTO_VALUES, TIPO_IMPUESTO_LABELS, type TipoImpuesto } from '@/constants';

const ANIOS = [2024, 2025, 2026, 2027, 2028];
const MESES = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

const MONTH_LABELS: Record<number, string> = {
  1: 'Enero',
  2: 'Febrero',
  3: 'Marzo',
  4: 'Abril',
  5: 'Mayo',
  6: 'Junio',
  7: 'Julio',
  8: 'Agosto',
  9: 'Septiembre',
  10: 'Octubre',
  11: 'Noviembre',
  12: 'Diciembre',
};

interface VencimientosFilterBarProps {
  impuesto: TipoImpuesto | 'all';
  anio: number | 'all';
  mes: number | 'all';
  onImpuestoChange: (v: TipoImpuesto | 'all') => void;
  onAnioChange: (v: number | 'all') => void;
  onMesChange: (v: number | 'all') => void;
  onClear: () => void;
}

export function VencimientosFilterBar({
  impuesto,
  anio,
  mes,
  onImpuestoChange,
  onAnioChange,
  onMesChange,
  onClear,
}: VencimientosFilterBarProps) {
  const t = useT();
  const hasFilters = impuesto !== 'all' || anio !== 'all' || mes !== 'all';

  return (
    <div className="mb-4 flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-muted-foreground">
          {t('vencimiento.filter.impuestoLabel', { defaultValue: 'Impuesto' })}:
        </label>
        <Select
          value={impuesto}
          onValueChange={(v) => onImpuestoChange(v as TipoImpuesto | 'all')}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {t('vencimiento.filter.impuestoAll', { defaultValue: 'Todos' })}
            </SelectItem>
            {TIPO_IMPUESTO_VALUES.map((ti) => (
              <SelectItem key={ti} value={ti}>
                {TIPO_IMPUESTO_LABELS[ti]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-muted-foreground">
          {t('vencimiento.filter.anioLabel', { defaultValue: 'Año' })}:
        </label>
        <Select
          value={String(anio)}
          onValueChange={(v) => onAnioChange(v === 'all' ? 'all' : parseInt(v, 10))}
        >
          <SelectTrigger className="w-[120px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {t('common.all', { defaultValue: 'Todos' })}
            </SelectItem>
            {ANIOS.map((a) => (
              <SelectItem key={a} value={String(a)}>
                {a}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-sm font-medium text-muted-foreground">
          {t('vencimiento.filter.mesLabel', { defaultValue: 'Mes' })}:
        </label>
        <Select
          value={String(mes)}
          onValueChange={(v) => onMesChange(v === 'all' ? 'all' : parseInt(v, 10))}
        >
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">
              {t('vencimiento.filter.mesAll', { defaultValue: 'Todos' })}
            </SelectItem>
            {MESES.map((m) => (
              <SelectItem key={m} value={String(m)}>
                {MONTH_LABELS[m]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="text-muted-foreground"
        >
          <Icons.close className="mr-1 h-3.5 w-3.5" />
          {t('vencimiento.filter.clear', { defaultValue: 'Limpiar filtros' })}
        </Button>
      )}
    </div>
  );
}
