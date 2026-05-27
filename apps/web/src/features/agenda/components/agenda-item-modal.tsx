'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Icons } from '@/components/icons';
import type { AgendaItem, CreateAgendaPayload, UpdateAgendaPayload } from '../api/types';

interface AgendaItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: AgendaItem | null;
  defaultDate?: string;
  onSave: (data: CreateAgendaPayload | (UpdateAgendaPayload & { id: number })) => void;
  onDelete: (id: number) => void;
}

export function AgendaItemModal({
  open,
  onOpenChange,
  item,
  defaultDate,
  onSave,
  onDelete,
}: AgendaItemModalProps) {
  const [titulo, setTitulo] = useState('');
  const [fecha, setFecha] = useState('');
  const [horaInicio, setHoraInicio] = useState('09:00');
  const [horaFin, setHoraFin] = useState('10:00');
  const [tipo, setTipo] = useState<'PERSONAL' | 'ESTUDIO' | 'TAREA'>('PERSONAL');
  const [descripcion, setDescripcion] = useState('');

  useEffect(() => {
    if (item) {
      setTitulo(item.titulo);
      setFecha(item.fecha.slice(0, 10));
      setHoraInicio(item.fecha.slice(11, 16));
      const endDate = new Date(item.fecha);
      endDate.setMinutes(endDate.getMinutes() + item.duracionMin);
      setHoraFin(endDate.toISOString().slice(11, 16));
      setTipo(item.tipo as 'PERSONAL' | 'ESTUDIO' | 'TAREA');
      setDescripcion(item.descripcion ?? '');
    } else {
      setTitulo('');
      setFecha(defaultDate ?? new Date().toISOString().slice(0, 10));
      setHoraInicio('09:00');
      setHoraFin('10:00');
      setTipo('PERSONAL');
      setDescripcion('');
    }
  }, [item, defaultDate, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fechaISO = new Date(`${fecha}T${horaInicio}:00`).toISOString();
    const [hFin, mFin] = horaFin.split(':').map(Number);
    const [hInicio, mInicio] = horaInicio.split(':').map(Number);
    const duracionMin = Math.max(15, (hFin * 60 + mFin) - (hInicio * 60 + mInicio));

    if (item) {
      onSave({
        id: item.id,
        titulo,
        fecha: fechaISO,
        duracionMin,
        tipo,
        descripcion: descripcion || undefined,
      });
    } else {
      onSave({
        titulo,
        fecha: fechaISO,
        duracionMin,
        tipo,
        descripcion: descripcion || undefined,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{item ? 'Editar Evento' : 'Nuevo Evento'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Nombre del evento"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fecha">Fecha</Label>
              <Input
                id="fecha"
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo</Label>
              <Select value={tipo} onValueChange={(v: 'PERSONAL' | 'ESTUDIO' | 'TAREA') => setTipo(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERSONAL">Personal</SelectItem>
                  <SelectItem value="ESTUDIO">Estudio</SelectItem>
                  <SelectItem value="TAREA">Tarea</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="horaInicio">Hora de comienzo</Label>
              <Input
                id="horaInicio"
                type="time"
                value={horaInicio}
                onChange={(e) => setHoraInicio(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="horaFin">Hora de fin</Label>
              <Input
                id="horaFin"
                type="time"
                value={horaFin}
                onChange={(e) => setHoraFin(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Descripción del evento (opcional)"
              rows={3}
            />
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            {item && (
              <Button
                type="button"
                variant="destructive"
                onClick={() => onDelete(item.id)}
                className="mr-auto"
              >
                <Icons.trash className="mr-2 h-4 w-4" />
                Eliminar
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {item ? 'Guardar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
