'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from '@tanstack/react-form';
import { Button } from '@/components/ui/button';
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
import { createTareaMutation, updateTareaMutation } from '../api/mutations';
import type { Tarea, CreateTareaPayload, UpdateTareaPayload } from '../api/types';

interface TareaFormSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tarea?: Tarea | null;
  encargados: { id: string; nombre: string }[];
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
  const createMutation = useMutation(createTareaMutation);
  const updateMutation = useMutation(updateTareaMutation);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!encargadoId) return;

    const basePayload = {
      titulo,
      descripcion: descripcion || undefined,
      tipo: tipo as CreateTareaPayload['tipo'],
      impuesto: impuesto ? (impuesto as CreateTareaPayload['impuesto']) : undefined,
      periodo: periodo || undefined,
      tiempoEstMin: tiempoEstMin ? parseInt(tiempoEstMin, 10) : undefined,
      prioridad: prioridad as CreateTareaPayload['prioridad'],
      vence: vence ? new Date(vence).toISOString() : undefined,
      notas: notas || undefined,
    };

    if (isEditing && tarea) {
      const payload: UpdateTareaPayload = {
        ...basePayload,
        encargadoId: encargadoId || undefined,
        clienteId: clienteId ? parseInt(clienteId, 10) : undefined,
        estado: estado as UpdateTareaPayload['estado'],
      };
      await updateMutation.mutateAsync({ id: tarea.id, values: payload });
    } else {
      const payload: CreateTareaPayload = {
        ...basePayload,
        encargadoId,
        clienteId: clienteId ? parseInt(clienteId, 10) : undefined,
      };
      await createMutation.mutateAsync(payload);
    }

    onOpenChange(false);
    resetForm();
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

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[400px] overflow-y-auto sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>{isEditing ? 'Editar Tarea' : 'Nueva Tarea'}</SheetTitle>
          <SheetDescription>
            {isEditing ? 'Modificá los campos de la tarea.' : 'Completá los datos para crear una nueva tarea.'}
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div className="space-y-2">
            <Label>Título *</Label>
            <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} required placeholder="Ej: Presentar DDJJ IVA Mayo" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tipo *</Label>
              <Select value={tipo} onValueChange={setTipo}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="DDJJ">DDJJ</SelectItem>
                  <SelectItem value="VEP">VEP</SelectItem>
                  <SelectItem value="INTERNA">Interna</SelectItem>
                  <SelectItem value="BALANCE">Balance</SelectItem>
                  <SelectItem value="OTRO">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Impuesto</Label>
              <Select value={impuesto} onValueChange={setImpuesto}>
                <SelectTrigger><SelectValue placeholder="Ninguno" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Ninguno</SelectItem>
                  <SelectItem value="IVA">IVA</SelectItem>
                  <SelectItem value="GANANCIAS">Ganancias</SelectItem>
                  <SelectItem value="AUTONOMOS">Autónomos</SelectItem>
                  <SelectItem value="IIBB_LOCAL">IIBB Local</SelectItem>
                  <SelectItem value="MUNICIPAL">Municipal</SelectItem>
                  <SelectItem value="SUELDOS">Sueldos</SelectItem>
                  <SelectItem value="MONOTRIBUTO">Monotributo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Encargado *</Label>
              <Select value={encargadoId} onValueChange={setEncargadoId}>
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  {encargados.map((u) => (
                    <SelectItem key={u.id} value={u.id}>{u.nombre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Cliente</Label>
              <Select value={clienteId} onValueChange={setClienteId}>
                <SelectTrigger><SelectValue placeholder="Sin cliente" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin cliente</SelectItem>
                  {clientes.map((c) => (
                    <SelectItem key={c.id} value={c.id.toString()}>{c.denominacion}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Prioridad</Label>
              <Select value={prioridad} onValueChange={setPrioridad}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALTA">Alta</SelectItem>
                  <SelectItem value="MEDIA">Media</SelectItem>
                  <SelectItem value="BAJA">Baja</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {isEditing && (
              <div className="space-y-2">
                <Label>Estado</Label>
                <Select value={estado} onValueChange={setEstado}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDIENTE">Pendiente</SelectItem>
                    <SelectItem value="EN_PROCESO">En Proceso</SelectItem>
                    <SelectItem value="COMPLETADA">Completada</SelectItem>
                    <SelectItem value="CANCELADA">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>Tiempo est. (min)</Label>
              <Input type="number" value={tiempoEstMin} onChange={(e) => setTiempoEstMin(e.target.value)} placeholder="60" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Período</Label>
              <Input value={periodo} onChange={(e) => setPeriodo(e.target.value)} placeholder="2026-05" />
            </div>
            <div className="space-y-2">
              <Label>Vencimiento</Label>
              <Input type="date" value={vence} onChange={(e) => setVence(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Descripción</Label>
            <Textarea value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Detalles adicionales..." rows={3} />
          </div>

          <div className="space-y-2">
            <Label>Notas</Label>
            <Textarea value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Notas internas..." rows={2} />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending || !encargadoId || !titulo}>
              {isPending ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear Tarea'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
