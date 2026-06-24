'use client';

import { useQuery } from '@tanstack/react-query';
import { useT } from '@/lib/i18n/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { formatDateShort } from '@/lib/format';
import { TIPO_IMPUESTO_LABELS, type TipoImpuesto } from '@/constants';
import { cn } from '@/lib/utils';
import { proximosVencimientosQueryOptions } from '../api/queries';
import type { VencimientoConClientes } from '../api/types';
import Link from 'next/link';

function daysTill(dateStr: string): number {
  const now = new Date();
  const d = new Date(dateStr);
  return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getDateColorClass(dateStr: string): string {
  const diff = daysTill(dateStr);
  if (diff < 0) return 'text-red-600';
  if (diff <= 7) return 'text-orange-600';
  return '';
}

function sortDigits(a: number, b: number): number {
  return a - b;
}

export function ProximosVencimientosCard() {
  const t = useT();
  const { data: result, isLoading } = useQuery(proximosVencimientosQueryOptions());

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            {t('vencimiento.proximos.title', { defaultValue: 'Próximos vencimientos' })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  const vencimientos = result?.data ?? [];

  // Group by fechaVence, then by (impuesto, digitoCuit)
  const byDate = new Map<string, Map<string, { impuesto: TipoImpuesto; digitos: number[]; clientes: VencimientoConClientes['clientes'] }>>();

  for (const v of vencimientos) {
    const dateKey = v.fechaVence.slice(0, 10);
    if (!byDate.has(dateKey)) byDate.set(dateKey, new Map());
    const groupKey = `${v.impuesto}`;
    const dateGroup = byDate.get(dateKey)!;
    if (!dateGroup.has(groupKey)) {
      dateGroup.set(groupKey, {
        impuesto: v.impuesto,
        digitos: [],
        clientes: [],
      });
    }
    const g = dateGroup.get(groupKey)!;
    if (!g.digitos.includes(v.digitoCuit)) g.digitos.push(v.digitoCuit);
    for (const c of v.clientes) {
      if (!g.clientes.some((ec) => ec.id === c.id)) g.clientes.push(c);
    }
  }

  // Sort digits within each group
  for (const dateGroup of byDate.values()) {
    for (const g of dateGroup.values()) {
      g.digitos.sort(sortDigits);
    }
  }

  if (vencimientos.length === 0) {
    return (
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">
            {t('vencimiento.proximos.title', { defaultValue: 'Próximos vencimientos' })}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center gap-3 py-6 text-center text-muted-foreground">
            <Icons.calendarClock className="h-10 w-10" />
            <p>{t('vencimiento.proximos.empty', { defaultValue: 'No hay vencimientos en los próximos 30 días' })}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">
          {t('vencimiento.proximos.title', { defaultValue: 'Próximos vencimientos' })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from(byDate.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([dateKey, taxGroups]) => {
            const diff = daysTill(dateKey);
            let dayLabel: string;
            if (diff < 0) {
              dayLabel = t('vencimiento.proximos.overdue', { defaultValue: 'Vencido' });
            } else if (diff === 0) {
              dayLabel = t('vencimiento.proximos.today', { defaultValue: 'Hoy' });
            } else if (diff === 1) {
              dayLabel = t('vencimiento.proximos.tomorrow', { defaultValue: 'Mañana' });
            } else {
              dayLabel = t('vencimiento.proximos.daysLeft', { defaultValue: `en ${diff} días`, days: diff });
            }

            return (
              <div key={dateKey} className="rounded-lg border p-3">
                <div className={cn('mb-2 text-sm font-semibold', getDateColorClass(dateKey))}>
                  <Icons.calendar className="mr-1.5 inline h-4 w-4" />
                  {formatDateShort(dateKey)} — {dayLabel}
                </div>
                <div className="space-y-2">
                  {Array.from(taxGroups.values()).map((g) => (
                    <div key={`${g.impuesto}`} className="rounded-md bg-muted/50 px-3 py-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {TIPO_IMPUESTO_LABELS[g.impuesto]}
                        </Badge>
                        <span className="text-muted-foreground">
                          {t('vencimiento.proximos.cuitGroup', { defaultValue: `CUIT terminado en ${g.digitos.join(',')}`, digit: g.digitos.join(',') })}
                        </span>
                      </div>
                      {g.clientes.length > 0 ? (
                        <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs">
                          {g.clientes.slice(0, 5).map((c) => (
                            <Link
                              key={c.id}
                              href={`/dashboard/clientes/${c.id}`}
                              className="text-primary hover:underline"
                            >
                              {c.denominacion}
                            </Link>
                          ))}
                          {g.clientes.length > 5 && (
                            <span className="text-muted-foreground">
                              {t('vencimiento.proximos.more', { defaultValue: `+${g.clientes.length - 5} más`, count: g.clientes.length - 5 })}
                            </span>
                          )}
                        </div>
                      ) : (
                        <p className="mt-1 text-xs text-muted-foreground">
                          {t('vencimiento.proximos.noClientes', { defaultValue: 'Ningún cliente activo tiene este vencimiento' })}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
      </CardContent>
    </Card>
  );
}
