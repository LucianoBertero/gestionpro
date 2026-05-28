'use client';

import { useEffect, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { useForm } from '@tanstack/react-form';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import { Label } from '@/components/ui/label';
import { useT } from '@/lib/i18n/client';
import { activeUsersQueryOptions } from '@/features/clientes/api/queries';
import { toast } from 'sonner';
import {
  TIPO_TAREA_VALUES,
  TIPO_IMPUESTO_VALUES,
  PRIORIDAD_VALUES,
  ESTADO_TAREA_VALUES,
} from '@/constants';
import { createTareaMutation, updateTareaMutation } from '../api/mutations';
import type { Tarea, CreateTareaPayload, UpdateTareaPayload } from '../api/types';

interface TareaFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tarea?: Tarea | null;
  encargados?: { id: string; nombre: string }[];
  clientes?: { id: number; denominacion: string }[];
}

export function TareaFormSheet({
  open,
  onOpenChange,
  tarea,
  encargados,
  clientes = [],
}: TareaFormSheetProps) {
  const isEditing = !!tarea;
  const t = useT();
  const createMutation = useMutation(createTareaMutation);
  const updateMutation = useMutation(updateTareaMutation);
  const { data: fetchedUsers = [] } = useQuery({
    ...activeUsersQueryOptions(),
    enabled: !encargados?.length,
  });

  const [titulo, setTitulo] = useState(tarea?.titulo ?? '');
  const [descripcion, setDescripcion] = useState(tarea?.descripcion ?? '');
  const [tipo, setTipo] = useState<string>(tarea?.tipo ?? 'DDJJ');
  const [impuesto, setImpuesto] = useState<string>(tarea?.impuesto ?? '');
  const [periodo, setPeriodo] = useState(tarea?.periodo ?? '');
  const [tiempoEstMin, setTiempoEstMin] = useState(tarea?.tiempoEstMin?.toString() ?? '');
  const [prioridad, setPrioridad] = useState<string>(tarea?.prioridad ?? 'MEDIA');
  const [estado, setEstado] = useState<string>(tarea?.estado ?? 'PENDIENTE');
  const [vence, setVence] = useState(tarea?.vence ? new Date(tarea.vence).toISOString().slice(0, 10) : '');
  const [encargadoId, setEncargadoId] = useState(tarea?.encargadoId ?? '');
  const [clienteId, setClienteId] = useState<string>(tarea?.clienteId?.toString() ?? '');
  const [notas, setNotas] = useState(tarea?.notas ?? '');

  useEffect(() => {
    if (!open) return;

    setTitulo(tarea?.titulo ?? '');
    setDescripcion(tarea?.descripcion ?? '');
    setTipo(tarea?.tipo ?? 'DDJJ');
    setImpuesto(tarea?.impuesto ?? '');
    setPeriodo(tarea?.periodo ?? '');
    setTiempoEstMin(tarea?.tiempoEstMin?.toString() ?? '');
    setPrioridad(tarea?.prioridad ?? 'MEDIA');
    setEstado(tarea?.estado ?? 'PENDIENTE');
    setVence(tarea?.vence ? new Date(tarea.vence).toISOString().slice(0, 10) : '');
    setEncargadoId(tarea?.encargadoId ?? '');
    setClienteId(tarea?.clienteId?.toString() ?? '');
    setNotas(tarea?.notas ?? '');
  }, [open, tarea]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!encargadoId) return;

    const normalizedImpuesto = impuesto && impuesto !== 'none' ? (impuesto as CreateTareaPayload['impuesto']) : undefined;
    const normalizedClienteId = clienteId && clienteId !== 'none' ? parseInt(clienteId, 10) : undefined;

    const basePayload = {
      titulo,
      descripcion: descripcion || undefined,
      tipo: tipo as CreateTareaPayload['tipo'],
      impuesto: normalizedImpuesto,
      periodo: periodo || undefined,
      tiempoEstMin: tiempoEstMin ? parseInt(tiempoEstMin, 10) : undefined,
      prioridad: prioridad as CreateTareaPayload['prioridad'],
      vence: vence ? new Date(vence).toISOString() : undefined,
      notas: notas || undefined,
    };

    try {
      if (isEditing && tarea) {
        const payload: UpdateTareaPayload = {
          ...basePayload,
          encargadoId: encargadoId || undefined,
          clienteId: normalizedClienteId,
          estado: estado as UpdateTareaPayload['estado'],
        };

        await toast.promise(updateMutation.mutateAsync({ id: tarea.id, values: payload }), {
          loading: tr('common.saving', 'Guardando...'),
          success: tr('tarea.saved', 'Tarea guardada'),
          error: tr('tarea.saveError', 'No se pudo guardar la tarea'),
        });
      } else {
        const payload: CreateTareaPayload = {
          ...basePayload,
          encargadoId,
          clienteId: normalizedClienteId,
        };

        await toast.promise(createMutation.mutateAsync(payload), {
          loading: tr('common.saving', 'Guardando...'),
          success: tr('tarea.created', 'Tarea creada'),
          error: tr('tarea.saveError', 'No se pudo guardar la tarea'),
        });
      }

      onOpenChange(false);
      resetForm();
    } catch {
      // toast.promise ya muestra el error; dejamos el sheet abierto para corregir.
    }
  };

  const resetForm = () => {
    setTitulo('');
    setDescripcion('');
    setTipo('DDJJ');
    setImpuesto('');
    setPeriodo('');
    setTiempoEstMin('');
    setPrioridad('MEDIA');
    setEstado('PENDIENTE');
    setVence('');
    setEncargadoId('');
    setClienteId('');
    setNotas('');
  };

  const isPending = createMutation.isPending || updateMutation.isPending;
  const encargadosList = encargados?.length ? encargados : (fetchedUsers as { id: string; nombre: string }[]);

  const tr = (key: string, fallback: string) => t(key, { defaultValue: fallback });

  const tipoLabel = (value: string) => tr(`tarea.options.tipo.${value}`, value);
  const impuestoLabel = (value: string) => tr(`tarea.options.impuesto.${value}`, value);
  const prioridadLabel = (value: string) => tr(`tarea.options.prioridad.${value}`, value);
  const estadoLabel = (value: string) => tr(`tarea.options.estado.${value}`, value);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] overflow-y-auto sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>{isEditing ? tr('tarea.edit', 'Editar Tarea') : tr('tarea.add', 'Nueva Tarea')}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? tr('tarea.formEditDescription', 'Modificá los campos de la tarea.')
              : tr('tarea.formAddDescription', 'Completá los datos para crear una nueva tarea.')}
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label>{tr('tarea.titulo', 'Título')} *</Label>
            <Input
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              required
              placeholder={tr('tarea.placeholderTitulo', 'Ej: Presentar DDJJ IVA Mayo')}
            />
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{tr('tarea.tipo', 'Tipo')} *</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TIPO_TAREA_VALUES.map((v) => (
                    <SelectItem key={v} value={v}>{tipoLabel(v)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{tr('tarea.impuesto', 'Impuesto')}</Label>
              <Select value={impuesto} onValueChange={setImpuesto}>
                <SelectTrigger className="w-full"><SelectValue placeholder={tr('tarea.none', 'Ninguno')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{tr('tarea.none', 'Ninguno')}</SelectItem>
                  {TIPO_IMPUESTO_VALUES.map((v) => (
                    <SelectItem key={v} value={v}>{impuestoLabel(v)}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{tr('tarea.encargado', 'Encargado')} *</Label>
              <Select value={encargadoId} onValueChange={setEncargadoId}>
                <SelectTrigger className="w-full"><SelectValue placeholder={tr('tarea.select', 'Seleccionar')} /></SelectTrigger>
                <SelectContent>
                  {encargadosList.map((u) => (
                    <SelectItem key={u.id} value={u.id}>{u.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{tr('tarea.cliente', 'Cliente')}</Label>
              <Select value={clienteId} onValueChange={setClienteId}>
                <SelectTrigger className="w-full"><SelectValue placeholder={tr('tarea.withoutClient', 'Sin cliente')} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">{tr('tarea.withoutClient', 'Sin cliente')}</SelectItem>
                  {clientes.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.denominacion}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {isEditing ? (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-2">
                <Label>{tr('tarea.prioridad', 'Prioridad')}</Label>
                <Select value={prioridad} onValueChange={setPrioridad}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRIORIDAD_VALUES.map((v) => (
                      <SelectItem key={v} value={v}>{prioridadLabel(v)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{tr('tarea.estado', 'Estado')}</Label>
                <Select value={estado} onValueChange={setEstado}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ESTADO_TAREA_VALUES.map((v) => (
                      <SelectItem key={v} value={v}>{estadoLabel(v)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{tr('tarea.tiempoEstMin', 'Tiempo est. (min)')}</Label>
                <Input
                  type="number"
                  value={tiempoEstMin}
                  onChange={(e) => setTiempoEstMin(e.target.value)}
                  placeholder={tr('tarea.placeholderTiempoEstMin', '60')}
                />
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{tr('tarea.prioridad', 'Prioridad')}</Label>
                <Select value={prioridad} onValueChange={setPrioridad}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {PRIORIDAD_VALUES.map((v) => (
                      <SelectItem key={v} value={v}>{prioridadLabel(v)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{tr('tarea.tiempoEstMin', 'Tiempo est. (min)')}</Label>
                <Input
                  type="number"
                  value={tiempoEstMin}
                  onChange={(e) => setTiempoEstMin(e.target.value)}
                  placeholder={tr('tarea.placeholderTiempoEstMin', '60')}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{tr('tarea.periodo', 'Período')}</Label>
              <Input
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
                placeholder={tr('tarea.placeholderPeriodo', '2026-05')}
              />
            </div>
            <div className="space-y-2">
              <Label>{tr('tarea.vence', 'Vence')}</Label>
              <Input type="date" value={vence} onChange={(e) => setVence(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{tr('tarea.descripcion', 'Descripción')}</Label>
            <Textarea
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder={tr('tarea.placeholderDescripcion', 'Detalles adicionales...')}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label>{tr('tarea.notas', 'Notas')}</Label>
            <Textarea
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder={tr('tarea.placeholderNotas', 'Notas internas...')}
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {tr('common.cancel', 'Cancelar')}
            </Button>
            <Button type="submit" disabled={!encargadoId || !titulo} isLoading={isPending}>
              {isEditing ? tr('common.save', 'Guardar') : tr('tarea.add', 'Nueva Tarea')}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}

export function TareaFormSheetTrigger() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setOpen(true)}>
        <Icons.add className='mr-2 h-4 w-4' />
        Nueva Tarea
      </Button>
      <TareaFormSheet open={open} onOpenChange={setOpen} />
    </>
  );
}
