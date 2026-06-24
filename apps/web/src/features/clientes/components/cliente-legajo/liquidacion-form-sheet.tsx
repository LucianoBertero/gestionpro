'use client';

import { useEffect, useState } from 'react';
import { useMutationWithOptions } from '@/hooks/use-mutation-with-options';
import { createLiqMutation, updateLiqMutation } from '@/features/liquidaciones/api/mutations';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Label } from '@/components/ui/label';
import { Icons } from '@/components/icons';
import { useT } from '@/lib/i18n/client';
import { toast } from 'sonner';
import {
  TIPO_IMPUESTO_VALUES,
  TIPO_IMPUESTO_LABELS,
  RESULTADO_LIQUIDACION_VALUES,
  RESULTADO_LABELS,
  type TipoImpuesto,
  type ResultadoLiquidacion,
} from '@/constants';
import type { Liquidacion } from '@/features/liquidaciones/api/types';

interface LiquidacionFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  liquidacion?: Liquidacion | null;
  clienteId: number;
}

export function LiquidacionFormSheet({
  open,
  onOpenChange,
  liquidacion,
  clienteId,
}: LiquidacionFormSheetProps) {
  const isEditing = !!liquidacion;
  const t = useT();
  const tr = (key: string, fallback: string) => t(key, { defaultValue: fallback });

  const [impuesto, setImpuesto] = useState<TipoImpuesto>('IVA');
  const [periodo, setPeriodo] = useState<Date | undefined>(undefined);
  const [resultado, setResultado] = useState<ResultadoLiquidacion>('A_PAGAR');
  const [importe, setImporte] = useState('');
  const [vencimiento, setVencimiento] = useState('');
  const [formaPago, setFormaPago] = useState('');

  // Reset form when sheet opens
  useEffect(() => {
    if (open) {
      if (liquidacion) {
        setImpuesto(liquidacion.impuesto);
        // Período is stored as YYYY-MM string in the backend. Initialize the
        // DatePicker with the first day of that month so the calendar shows
        // something coherent. The day is irrelevant — only the year-month
        // is sent to the backend.
        setPeriodo(
          liquidacion.periodo ? new Date(`${liquidacion.periodo}-01`) : undefined,
        );
        setResultado(liquidacion.resultado);
        setImporte(liquidacion.importe != null ? liquidacion.importe.toString() : '');
        // Display the date portion only (YYYY-MM-DD) for the text input.
        setVencimiento(
          liquidacion.vencimiento ? liquidacion.vencimiento.slice(0, 10) : '',
        );
        setFormaPago(liquidacion.formaPago ?? '');
      } else {
        setImpuesto('IVA');
        setPeriodo(undefined);
        setResultado('A_PAGAR');
        setImporte('');
        setVencimiento('');
        setFormaPago('');
      }
    }
  }, [open, liquidacion]);

  const createMutation = useMutationWithOptions(createLiqMutation, {
    onSuccess: () => {
      toast.success(tr('liquidacion.created', 'Liquidación creada'));
      onOpenChange(false);
    },
    onError: () =>
      toast.error(tr('liquidacion.createError', 'No se pudo crear la liquidación')),
  });

  const updateMutation = useMutationWithOptions(updateLiqMutation, {
    onSuccess: () => {
      toast.success(tr('liquidacion.updated', 'Liquidación actualizada'));
      onOpenChange(false);
    },
    onError: () =>
      toast.error(tr('liquidacion.updateError', 'No se pudo actualizar la liquidación')),
  });

  const handleSave = () => {
    if (!impuesto || !periodo || !resultado) {
      toast.error(tr('liquidacion.missingFields', 'Completá los campos requeridos'));
      return;
    }

    const vencimientoVal = vencimiento.trim() || undefined;
    const importeNum = importe ? Number(importe) : undefined;
    const formaPagoVal = formaPago.trim() || undefined;
    // Período is a Date from the picker; backend expects YYYY-MM string.
    // The day of the picked date is irrelevant.
    const periodoVal = periodo ? periodo.toISOString().slice(0, 7) : '';

    if (isEditing && liquidacion) {
      updateMutation.mutate({
        id: liquidacion.id,
        values: {
          impuesto,
          periodo: periodoVal,
          resultado,
          importe: importeNum,
          vencimiento: vencimientoVal,
          formaPago: formaPagoVal,
        },
      });
    } else {
      createMutation.mutate({
        clienteId,
        impuesto,
        periodo: periodoVal,
        resultado,
        importe: importeNum,
        vencimiento: vencimientoVal,
        formaPago: formaPagoVal,
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className='w-[400px] overflow-y-auto sm:w-[480px]'>
        <SheetHeader>
          <SheetTitle>
            {isEditing
              ? tr('liquidacion.edit', 'Editar Liquidación')
              : tr('liquidacion.add', 'Nueva Liquidación')}
          </SheetTitle>
          <SheetDescription>
            {isEditing
              ? tr(
                  'liquidacion.formEditDescription',
                  'Modificá los campos de la liquidación.',
                )
              : tr(
                  'liquidacion.formAddDescription',
                  'Completá los datos para crear una nueva liquidación.',
                )}
          </SheetDescription>
        </SheetHeader>
        <div className='mt-6 space-y-4'>
          {/* Impuesto */}
          <div className='space-y-2'>
            <Label>{tr('liquidacion.impuesto', 'Impuesto')} *</Label>
            <Select
              value={impuesto}
              onValueChange={(v) => setImpuesto(v as TipoImpuesto)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIPO_IMPUESTO_VALUES.map((ti) => (
                  <SelectItem key={ti} value={ti}>
                    {TIPO_IMPUESTO_LABELS[ti]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Período */}
          <div className='space-y-2'>
            <Label>{tr('liquidacion.periodo', 'Período')} *</Label>
            <DatePicker
              value={periodo}
              onChange={setPeriodo}
              placeholder={tr(
                'liquidacion.placeholderPeriodo',
                'Seleccioná el mes',
              )}
            />
          </div>

          {/* Resultado */}
          <div className='space-y-2'>
            <Label>{tr('liquidacion.resultado', 'Resultado')} *</Label>
            <Select
              value={resultado}
              onValueChange={(v) => setResultado(v as ResultadoLiquidacion)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {RESULTADO_LIQUIDACION_VALUES.map((r) => (
                  <SelectItem key={r} value={r}>
                    {RESULTADO_LABELS[r]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Importe */}
          <div className='space-y-2'>
            <Label>{tr('liquidacion.importe', 'Importe')}</Label>
            <Input
              type='number'
              value={importe}
              onChange={(e) => setImporte(e.target.value)}
              placeholder={tr('liquidacion.placeholderImporte', '0.00')}
            />
          </div>

          {/* Vencimiento */}
          <div className='space-y-2'>
            <Label>{tr('liquidacion.vencimiento', 'Vencimiento')}</Label>
            <Input
              type='date'
              value={vencimiento}
              onChange={(e) => setVencimiento(e.target.value)}
              placeholder={tr(
                'liquidacion.placeholderVencimiento',
                'YYYY-MM-DD',
              )}
            />
          </div>

          {/* Forma de pago */}
          <div className='space-y-2'>
            <Label>{tr('liquidacion.formaPago', 'Forma de pago')}</Label>
            <Input
              value={formaPago}
              onChange={(e) => setFormaPago(e.target.value)}
              placeholder={tr(
                'liquidacion.placeholderFormaPago',
                'Efectivo, Transferencia...',
              )}
            />
          </div>

          {/* Actions */}
          <div className='flex justify-end gap-3 pt-4'>
            <Button variant='outline' onClick={() => onOpenChange(false)}>
              {tr('common.cancel', 'Cancelar')}
            </Button>
            <Button onClick={handleSave} disabled={isPending}>
              {isPending ? (
                <Icons.spinner className='mr-2 h-4 w-4 animate-spin' />
              ) : null}
              {tr('common.save', 'Guardar')}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
