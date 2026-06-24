'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { liquidacionesQueryOptions } from '@/features/liquidaciones/api/queries';
import { deleteLiqMutation } from '@/features/liquidaciones/api/mutations';
import { useMutationWithOptions } from '@/hooks/use-mutation-with-options';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { Icons } from '@/components/icons';
import { Skeleton } from '@/components/ui/skeleton';
import { useT } from '@/lib/i18n/client';
import { formatDateShort, formatCurrency } from '@/lib/format';
import { toast } from 'sonner';
import {
  TIPO_IMPUESTO_VALUES,
  TIPO_IMPUESTO_LABELS,
  getResultadoBadgeVariant,
  RESULTADO_LABELS,
} from '@/constants';
import type { Liquidacion } from '@/features/liquidaciones/api/types';
import { LiquidacionFormSheet } from './liquidacion-form-sheet';

interface LiquidacionesTabProps {
  clienteId: number;
}

export function LiquidacionesTab({ clienteId }: LiquidacionesTabProps) {
  const t = useT();
  const tr = (key: string, fallback: string) => t(key, { defaultValue: fallback });

  const { data: liquidacionesData, isLoading } = useQuery(
    liquidacionesQueryOptions({ clienteId }),
  );

  const [impuestoFilter, setImpuestoFilter] = useState('none');
  const [formOpen, setFormOpen] = useState(false);
  const [editingLiquidacion, setEditingLiquidacion] = useState<Liquidacion | null>(
    null,
  );

  const deleteMutation = useMutationWithOptions(deleteLiqMutation, {
    onSuccess: () =>
      toast.success(tr('liquidacion.deleted', 'Liquidación eliminada')),
    onError: () =>
      toast.error(tr('liquidacion.deleteError', 'No se pudo eliminar la liquidación')),
  });

  const handleDelete = (id: number) => {
    if (confirm(tr('liquidacion.confirmDelete', '¿Eliminar esta liquidación?'))) {
      deleteMutation.mutate(id);
    }
  };

  const handleEditClick = (liq: Liquidacion) => {
    setEditingLiquidacion(liq);
    setFormOpen(true);
  };

  const handleNewClick = () => {
    setEditingLiquidacion(null);
    setFormOpen(true);
  };

  const liquidaciones = liquidacionesData?.data ?? [];

  // Filter by impuesto
  const filtered =
    impuestoFilter === 'none'
      ? liquidaciones
      : liquidaciones.filter((l) => l.impuesto === impuestoFilter);

  // Sort by periodo DESC, fallback to creadoEn DESC
  const sorted = [...filtered].sort((a, b) => {
    const aKey = a.periodo || a.creadoEn;
    const bKey = b.periodo || b.creadoEn;
    return bKey.localeCompare(aKey);
  });

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <div className='flex items-center justify-between'>
          <Skeleton className='h-7 w-36' />
          <Skeleton className='h-9 w-44' />
        </div>
        <Skeleton className='h-10 w-[200px]' />
        <div className='space-y-2'>
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className='h-14 w-full' />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold'>
          {tr('liquidacion.title', 'Liquidaciones')} ({liquidaciones.length})
        </h3>
        <Button size='sm' onClick={handleNewClick}>
          <Icons.add className='mr-2 h-4 w-4' />
          {tr('liquidacion.add', 'Nueva Liquidación')}
        </Button>
      </div>

      {/* Filter */}
      <div className='flex items-center gap-2'>
        <Select value={impuestoFilter} onValueChange={setImpuestoFilter}>
          <SelectTrigger className='w-[200px]'>
            <SelectValue
              placeholder={tr('liquidacion.filter.impuesto', 'Filtrar por impuesto')}
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='none'>
              {tr('liquidacion.filter.all', 'Todos')}
            </SelectItem>
            {TIPO_IMPUESTO_VALUES.map((ti) => (
              <SelectItem key={ti} value={ti}>
                {TIPO_IMPUESTO_LABELS[ti]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* List or Empty */}
      {sorted.length === 0 ? (
        <Card>
          <CardContent className='flex flex-col items-center justify-center gap-3 py-16 text-center'>
            <Icons.trendingUp className='text-muted-foreground h-12 w-12' />
            <div>
              <p className='text-lg font-semibold text-muted-foreground'>
                {tr(
                  'liquidacion.empty.title',
                  'No hay liquidaciones para este cliente',
                )}
              </p>
              <p className='text-muted-foreground text-sm'>
                {tr('liquidacion.empty.hint', 'Agregá una usando el botón de arriba')}
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className='divide-y pt-2'>
            {sorted.map((liq) => (
              <div
                key={liq.id}
                className='group flex items-center justify-between py-3 first:pt-1 last:pb-1'
              >
                <div className='flex min-w-0 flex-1 flex-wrap items-center gap-x-3 gap-y-1'>
                  <Badge variant='outline'>
                    {TIPO_IMPUESTO_LABELS[liq.impuesto]}
                  </Badge>
                  <span className='font-medium'>{liq.periodo}</span>
                  <Badge variant={getResultadoBadgeVariant(liq.resultado)}>
                    {RESULTADO_LABELS[liq.resultado]}
                  </Badge>
                  {liq.importe != null && (
                    <span className='text-muted-foreground text-sm'>
                      {formatCurrency(liq.importe)}
                    </span>
                  )}
                  <span className='text-muted-foreground text-sm'>
                    {liq.vencimiento
                      ? formatDateShort(liq.vencimiento)
                      : tr('tarea.sinFecha', 'Sin fecha')}
                  </span>
                </div>

                {/* Actions dropdown */}
                <div className='flex shrink-0 items-center gap-1'>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant='ghost'
                        size='icon'
                        className='h-7 w-7 opacity-0 transition-opacity group-hover:opacity-100'
                      >
                        <Icons.ellipsis className='h-3.5 w-3.5' />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align='end' className='w-40'>
                      <DropdownMenuItem onClick={() => handleEditClick(liq)}>
                        <Icons.edit className='mr-2 h-3.5 w-3.5' />
                        {tr('common.edit', 'Editar')}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(liq.id)}
                        className='text-destructive'
                      >
                        <Icons.trash className='mr-2 h-3.5 w-3.5' />
                        {tr('common.delete', 'Eliminar')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Form Sheet */}
      <LiquidacionFormSheet
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingLiquidacion(null);
        }}
        liquidacion={editingLiquidacion}
        clienteId={clienteId}
      />
    </div>
  );
}
