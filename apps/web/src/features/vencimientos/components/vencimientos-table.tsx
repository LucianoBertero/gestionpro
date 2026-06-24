'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Icons } from '@/components/icons';
import { useT } from '@/lib/i18n/client';
import { formatDateShort } from '@/lib/format';
import { TIPO_IMPUESTO_LABELS } from '@/constants';
import { cn } from '@/lib/utils';
import type { VencimientoConClientes, VencimientosListMeta } from '../api/types';
import Link from 'next/link';

const MONTH_NAMES = [
  '', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

function daysTill(dateStr: string): number {
  const now = new Date();
  const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const d = new Date(dateStr);
  const targetDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return Math.ceil((targetDate.getTime() - nowDate.getTime()) / (1000 * 60 * 60 * 24));
}

function getDateBadgeVariant(dateStr: string): 'destructive' | 'default' | 'outline' {
  const diff = daysTill(dateStr);
  if (diff < 0) return 'destructive';
  if (diff <= 7) return 'default';
  return 'outline';
}

function getCuitLast4(cuit: string): string {
  const cleaned = cuit.replace(/\D/g, '');
  return cleaned.slice(-4);
}

interface VencimientosTableProps {
  data: VencimientoConClientes[];
  meta?: VencimientosListMeta;
  isLoading: boolean;
  page: number;
  onPageChange: (page: number) => void;
}

export function VencimientosTable({ data, meta, isLoading, page, onPageChange }: VencimientosTableProps) {
  const t = useT();
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  function toggleRow(id: number) {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const totalPages = meta ? Math.ceil(meta.total / meta.take) : 1;
  const totalItems = meta?.total ?? 0;

  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
        <Icons.calendar className="mb-3 h-10 w-10" />
        <p>{t('vencimiento.empty.filtered', { defaultValue: 'No hay vencimientos que coincidan con los filtros' })}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>{t('vencimiento.impuesto', { defaultValue: 'Impuesto' })}</TableHead>
            <TableHead>{t('vencimiento.filter.anioLabel', { defaultValue: 'Año' })}</TableHead>
            <TableHead>{t('vencimiento.filter.mesLabel', { defaultValue: 'Mes' })}</TableHead>
            <TableHead>CU IT</TableHead>
            <TableHead>{t('vencimiento.fechaVence', { defaultValue: 'Vence' })}</TableHead>
            <TableHead>{t('vencimiento.table.clientes', { defaultValue: 'Clientes' })}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((v) => {
            const isExpanded = expandedRows.has(v.id);
            return (
              <>
                <TableRow key={v.id} className={cn(isExpanded && 'border-b-0')}>
                  <TableCell className="font-medium">
                    {TIPO_IMPUESTO_LABELS[v.impuesto] ?? v.impuesto}
                  </TableCell>
                  <TableCell>{v.anio}</TableCell>
                  <TableCell>{MONTH_NAMES[v.mes] ?? v.mes}</TableCell>
                  <TableCell>{v.digitoCuit}</TableCell>
                  <TableCell>
                    <Badge variant={getDateBadgeVariant(v.fechaVence)}>
                      {formatDateShort(v.fechaVence)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleRow(v.id)}
                      className="h-7 gap-1 px-2 text-xs"
                    >
                      {v.clientes.length}
                      <Icons.chevronDown
                        className={cn(
                          'h-3.5 w-3.5 transition-transform',
                          isExpanded && 'rotate-180',
                        )}
                      />
                    </Button>
                  </TableCell>
                </TableRow>
                {isExpanded && (
                  <TableRow key={`${v.id}-expanded`} className="bg-muted/30">
                    <TableCell colSpan={6} className="py-2">
                      {v.clientes.length === 0 ? (
                        <p className="py-2 text-center text-xs text-muted-foreground">
                          {t('vencimiento.proximos.noClientes', { defaultValue: 'Ningún cliente activo tiene este vencimiento' })}
                        </p>
                      ) : (
                        <div className="grid grid-cols-1 gap-0.5 sm:grid-cols-2 lg:grid-cols-3">
                          {v.clientes.map((c) => (
                            <Link
                              key={c.id}
                              href={`/dashboard/clientes/${c.id}`}
                              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm hover:bg-accent"
                            >
                              <span className="truncate">{c.denominacion}</span>
                              <span className="shrink-0 text-xs text-muted-foreground">
                                {t('vencimiento.table.cuitLastDigits', { defaultValue: `CUIT ••${getCuitLast4(c.cuit)}`, last4: getCuitLast4(c.cuit) })}
                              </span>
                            </Link>
                          ))}
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                )}
              </>
            );
          })}
        </TableBody>
      </Table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between border-t px-4 py-3">
          <p className="text-sm text-muted-foreground">
            {totalItems > 0
              ? t('vencimiento.pagination.pageOf', { defaultValue: `Página ${page} de ${totalPages}`, page, total: totalPages })
              : ''}
            {totalItems > 0 && ` (${totalItems} ${t('common.total', { defaultValue: 'total' }).toLowerCase()})`}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => onPageChange(page - 1)}
            >
              <Icons.chevronLeft className="mr-1 h-4 w-4" />
              {t('vencimiento.pagination.previous', { defaultValue: 'Anterior' })}
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => onPageChange(page + 1)}
            >
              {t('vencimiento.pagination.next', { defaultValue: 'Siguiente' })}
              <Icons.chevronRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
