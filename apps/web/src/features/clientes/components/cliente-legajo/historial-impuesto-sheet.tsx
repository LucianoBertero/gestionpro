'use client';

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { TIPO_IMPUESTO_LABELS, RESULTADO_LABELS } from '@/constants';
import { historialImpuestoQueryOptions } from '../../api/queries-impuestos-estado';

interface HistorialImpuestoSheetProps {
  clienteId: number;
  clienteImpuestoId: number | null;
  tipo: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return format(new Date(iso), 'dd/MM/yyyy', { locale: es });
}

function formatImporte(value: number | null): string {
  if (value === null) return '—';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2,
  }).format(value);
}

export function HistorialImpuestoSheet({
  clienteId,
  clienteImpuestoId,
  tipo,
  open,
  onOpenChange,
}: HistorialImpuestoSheetProps) {
  const { data, isLoading } = useQuery({
    ...historialImpuestoQueryOptions(clienteId, clienteImpuestoId ?? 0),
    enabled: open && clienteImpuestoId !== null,
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side='right' className='sm:max-w-md'>
        <SheetHeader>
          <SheetTitle>
            Historial — {tipo ? TIPO_IMPUESTO_LABELS[tipo as keyof typeof TIPO_IMPUESTO_LABELS] ?? tipo : ''}
          </SheetTitle>
          <SheetDescription>
            Liquidaciones registradas para este impuesto.
          </SheetDescription>
        </SheetHeader>

        <div className='flex-1 overflow-y-auto px-6'>
          {isLoading ? (
            <div className='space-y-3'>
              <Skeleton className='h-16 w-full' />
              <Skeleton className='h-16 w-full' />
              <Skeleton className='h-16 w-full' />
            </div>
          ) : !data || data.length === 0 ? (
            <div className='flex flex-col items-center justify-center gap-2 py-12 text-center text-sm text-muted-foreground'>
              <Icons.clock className='h-8 w-8' />
              <p>No hay liquidaciones registradas para este impuesto.</p>
            </div>
          ) : (
            <div className='space-y-2'>
              {data.map((liq) => (
                <div
                  key={liq.id}
                  className='rounded-lg border p-3 text-sm'
                >
                  <div className='flex items-center justify-between'>
                    <span className='font-medium'>{liq.periodo}</span>
                    <Badge variant='outline'>{RESULTADO_LABELS[liq.resultado]}</Badge>
                  </div>
                  <div className='mt-2 flex items-center justify-between text-xs text-muted-foreground'>
                    <span>Creado: {formatDate(liq.creadoEn)}</span>
                    <span>{formatImporte(liq.importe)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className='mt-auto border-t px-6 py-4'>
          <Button
            variant='outline'
            className='w-full'
            onClick={() => onOpenChange(false)}
          >
            Cerrar
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
