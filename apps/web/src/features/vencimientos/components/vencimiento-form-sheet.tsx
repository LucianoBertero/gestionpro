'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Input } from '@/components/ui/input';
import { DatePicker } from '@/components/ui/date-picker';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { useT } from '@/lib/i18n/client';
import { TIPO_IMPUESTO_VALUES } from '@/constants';
import { toast } from 'sonner';
import {
  createVencimientoMutation,
  createVencimientosBatchMutation,
} from '../api/mutations';
import type { CreateVencimientoPayload } from '../api/types';

const MESES = Array.from({ length: 12 }, (_, i) => i + 1);
const DIGITOS = Array.from({ length: 10 }, (_, i) => i);
const CURRENT_YEAR = new Date().getFullYear();

interface VencimientoFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function VencimientoFormSheet({ open, onOpenChange }: VencimientoFormSheetProps) {
  const t = useT();
  const tr = (key: string, fallback: string) => t(key, { defaultValue: fallback });

  const createMutation = useMutation(createVencimientoMutation);
  const batchMutation = useMutation(createVencimientosBatchMutation);

  // Individual mode state
  const [impuesto, setImpuesto] = useState<string>('');
  const [anio, setAnio] = useState(CURRENT_YEAR);
  const [mes, setMes] = useState<number | ''>('');
  const [digitoCuit, setDigitoCuit] = useState<number | ''>('');
  const [fechaVence, setFechaVence] = useState<Date | undefined>(undefined);

  // Batch mode state
  const [batchImpuesto, setBatchImpuesto] = useState<string>('');
  const [batchAnio, setBatchAnio] = useState(CURRENT_YEAR);
  const [batchMes, setBatchMes] = useState<number | ''>('');
  const [batchFechas, setBatchFechas] = useState<(Date | undefined)[]>(
    Array.from({ length: 10 }, () => undefined),
  );

  const resetIndividual = () => {
    setImpuesto('');
    setAnio(CURRENT_YEAR);
    setMes('');
    setDigitoCuit('');
    setFechaVence(undefined);
  };

  const resetBatch = () => {
    setBatchImpuesto('');
    setBatchAnio(CURRENT_YEAR);
    setBatchMes('');
    setBatchFechas(Array.from({ length: 10 }, () => undefined));
  };

  const handleIndividualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!impuesto || mes === '' || digitoCuit === '' || !fechaVence) return;

    const payload: CreateVencimientoPayload = {
      impuesto: impuesto as CreateVencimientoPayload['impuesto'],
      anio,
      mes: mes as number,
      digitoCuit: digitoCuit as number,
      fechaVence: fechaVence.toISOString().slice(0, 10),
    };

    try {
      await toast.promise(createMutation.mutateAsync(payload), {
        loading: tr('common.saving', 'Guardando...'),
        success: tr('vencimiento.form.created', 'Vencimiento creado'),
        error: tr('vencimiento.form.createError', 'No se pudo crear el vencimiento'),
      });
      resetIndividual();
      onOpenChange(false);
    } catch {
      // toast.promise shows the error; keep sheet open for correction
    }
  };

  const handleBatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchImpuesto || batchMes === '') return;

    const rows: CreateVencimientoPayload[] = DIGITOS.map((digito, idx) => {
      const date = batchFechas[idx];
      return {
        impuesto: batchImpuesto as CreateVencimientoPayload['impuesto'],
        anio: batchAnio,
        mes: batchMes as number,
        digitoCuit: digito,
        fechaVence: date ? date.toISOString().slice(0, 10) : '',
      };
    }).filter((row) => row.fechaVence !== '');

    if (rows.length === 0) return;

    try {
      await toast.promise(batchMutation.mutateAsync(rows), {
        loading: tr('common.saving', 'Guardando...'),
        success: tr('vencimiento.form.createdBatch', '10 vencimientos creados'),
        error: tr('vencimiento.form.createError', 'No se pudo crear los vencimientos'),
      });
      resetBatch();
      onOpenChange(false);
    } catch {
      // toast.promise shows the error
    }
  };

  const isIndividualPending = createMutation.isPending;
  const isBatchPending = batchMutation.isPending;

  const impuestoLabel = (value: string) => tr(`impuesto.${value}`, value);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] overflow-y-auto sm:w-[580px]">
        <SheetHeader>
          <SheetTitle>
            {tr('vencimiento.form.title.new', 'Nuevo vencimiento')}
          </SheetTitle>
          <SheetDescription>
            {tr('common.optional', 'Completá los datos para cargar uno o más vencimientos.')}
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="individual" className="mt-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="individual">
              {tr('vencimiento.form.mode.individual', 'Individual')}
            </TabsTrigger>
            <TabsTrigger value="batch">
              {tr('vencimiento.form.mode.batch', 'Por mes')}
            </TabsTrigger>
          </TabsList>

          {/* ── Individual tab ── */}
          <TabsContent value="individual">
            <form onSubmit={handleIndividualSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>{tr('vencimiento.form.impuesto', 'Impuesto')} *</Label>
                <Select value={impuesto} onValueChange={setImpuesto}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder={tr('common.select', 'Seleccionar')} />
                  </SelectTrigger>
                  <SelectContent>
                    {TIPO_IMPUESTO_VALUES.map((v) => (
                      <SelectItem key={v} value={v}>{impuestoLabel(v)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{tr('vencimiento.form.anio', 'Año')} *</Label>
                  <Input
                    type="number"
                    min={2000}
                    max={2100}
                    value={anio}
                    onChange={(e) => setAnio(parseInt(e.target.value, 10) || CURRENT_YEAR)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>{tr('vencimiento.form.mes', 'Mes')} *</Label>
                  <Select
                    value={mes === '' ? '' : String(mes)}
                    onValueChange={(v) => setMes(parseInt(v, 10))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={tr('common.select', 'Seleccionar')} />
                    </SelectTrigger>
                    <SelectContent>
                      {MESES.map((m) => (
                        <SelectItem key={m} value={String(m)}>
                          {tr(`common.month.${m}`, String(m))}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{tr('vencimiento.form.digitoCuit', 'Dígito del CUIT')} *</Label>
                  <Select
                    value={digitoCuit === '' ? '' : String(digitoCuit)}
                    onValueChange={(v) => setDigitoCuit(parseInt(v, 10))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={tr('common.select', 'Seleccionar')} />
                    </SelectTrigger>
                    <SelectContent>
                      {DIGITOS.map((d) => (
                        <SelectItem key={d} value={String(d)}>
                          {d}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{tr('vencimiento.form.fechaVence', 'Fecha de vencimiento')} *</Label>
                  <DatePicker
                    value={fechaVence}
                    onChange={setFechaVence}
                    placeholder={tr('vencimiento.form.fechaVence', 'Seleccioná una fecha')}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  {tr('vencimiento.form.cancel', 'Cancelar')}
                </Button>
                <Button
                  type="submit"
                  disabled={!impuesto || mes === '' || digitoCuit === '' || !fechaVence}
                  isLoading={isIndividualPending}
                >
                  {tr('vencimiento.form.submit', 'Guardar')}
                </Button>
              </div>
            </form>
          </TabsContent>

          {/* ── Batch (por mes) tab ── */}
          <TabsContent value="batch">
            <form onSubmit={handleBatchSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>{tr('vencimiento.form.impuesto', 'Impuesto')} *</Label>
                  <Select value={batchImpuesto} onValueChange={setBatchImpuesto}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={tr('common.select', 'Seleccionar')} />
                    </SelectTrigger>
                    <SelectContent>
                      {TIPO_IMPUESTO_VALUES.map((v) => (
                        <SelectItem key={v} value={v}>{impuestoLabel(v)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{tr('vencimiento.form.anio', 'Año')} *</Label>
                  <Input
                    type="number"
                    min={2000}
                    max={2100}
                    value={batchAnio}
                    onChange={(e) => setBatchAnio(parseInt(e.target.value, 10) || CURRENT_YEAR)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>{tr('vencimiento.form.mes', 'Mes')} *</Label>
                  <Select
                    value={batchMes === '' ? '' : String(batchMes)}
                    onValueChange={(v) => setBatchMes(parseInt(v, 10))}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={tr('common.select', 'Seleccionar')} />
                    </SelectTrigger>
                    <SelectContent>
                      {MESES.map((m) => (
                        <SelectItem key={m} value={String(m)}>
                          {tr(`common.month.${m}`, String(m))}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="rounded-lg border bg-muted/30 p-3">
                <p className="mb-3 text-sm font-medium">
                  {tr('vencimiento.form.fechaVence', 'Fecha de vencimiento')} — {tr('vencimiento.form.submitBatch', '10 dígitos')}
                </p>
                <div className="grid grid-cols-2 gap-3">
                  {DIGITOS.map((digito, idx) => (
                    <div key={digito} className="space-y-1">
                      <Label className="text-xs">
                        {tr('vencimiento.form.digito', 'Dígito {{n}}').replace('{{n}}', String(digito))}
                      </Label>
                      <DatePicker
                        value={batchFechas[idx]}
                        onChange={(date) => {
                          const next = [...batchFechas];
                          next[idx] = date;
                          setBatchFechas(next);
                        }}
                        placeholder={`Dígito ${digito}`}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  {tr('vencimiento.form.cancel', 'Cancelar')}
                </Button>
                <Button
                  type="submit"
                  disabled={!batchImpuesto || batchMes === '' || batchFechas.every((d) => !d)}
                  isLoading={isBatchPending}
                >
                  {tr('vencimiento.form.submitBatch', 'Guardar 10 fechas')}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
