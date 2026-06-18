'use client';

import { useQuery } from '@tanstack/react-query';

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
import { TIPO_IMPUESTO_LABELS, RESULTADO_LABELS, NULL_PLACEHOLDER } from '@/constants';
import { useT } from '@/lib/i18n/client';
import { formatDateShort, formatCurrency } from '@/lib/format';
import { historialImpuestoQueryOptions } from '../../api/queries-impuestos-estado';

interface HistorialImpuestoSheetProps {
  clienteId: number;
  clienteImpuestoId: number | null;
  tipo: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Tr = (key: string, fallback: string) => string;

export function HistorialImpuestoSheet({
  clienteId,
  clienteImpuestoId,
  tipo,
  open,
  onOpenChange,
}: HistorialImpuestoSheetProps) {
  const t = useT();
  const tr: Tr = (key, fallback) => t(key, { defaultValue: fallback });
  const { data, isLoading } = useQuery({
    ...historialImpuestoQueryOptions(clienteId, clienteImpuestoId ?? 0),
    enabled: open && clienteImpuestoId !== null,
  });

  const tipoLabel = tipo
    ? (TIPO_IMPUESTO_LABELS[tipo as keyof typeof TIPO_IMPUESTO_LABELS] ?? tipo)
    : '';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side='right' className='sm:max-w-md'>
        <SheetHeader>
          <SheetTitle>
            {tr('impuestoCliente.historial.title', 'Historial')} — {tipoLabel}
          </SheetTitle>
          <SheetDescription>
            {tr('impuestoCliente.historial.description', 'Liquidaciones registradas para este impuesto.')}
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
            <div className='text-muted-foreground flex flex-col items-center justify-center gap-2 py-12 text-center text-sm'>
              <Icons.clock className='h-8 w-8' />
              <p>{tr('impuestoCliente.historial.empty', 'No hay liquidaciones registradas para este impuesto.')}</p>
            </div>
          ) : (
            <div className='space-y-2'>
              {data.map((liq) => (
                <div key={liq.id} className='rounded-lg border p-3 text-sm'>
                  <div className='flex items-center justify-between'>
                    <span className='font-medium'>{liq.periodo}</span>
                    <Badge variant='outline'>{RESULTADO_LABELS[liq.resultado]}</Badge>
                  </div>
                  <div className='text-muted-foreground mt-2 flex items-center justify-between text-xs'>
                    <span>
                      {tr('impuestoCliente.historial.creado', 'Creado')}:{' '}
                      {liq.creadoEn ? formatDateShort(liq.creadoEn) : NULL_PLACEHOLDER}
                    </span>
                    <span>{liq.importe !== null ? formatCurrency(liq.importe) : NULL_PLACEHOLDER}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className='mt-auto border-t px-6 py-4'>
          <Button variant='outline' className='w-full' onClick={() => onOpenChange(false)}>
            {tr('common.close', 'Cerrar')}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
