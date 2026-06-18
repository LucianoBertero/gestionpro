'use client';

import { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
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
import { Checkbox } from '@/components/ui/checkbox';
import { Icons } from '@/components/icons';
import { DatePicker } from '@/components/ui/date-picker';
import { TimePicker } from '@/components/ui/time-picker';
import { useQuery } from '@tanstack/react-query';
import { useT } from '@/lib/i18n/client';
import { agendaUsuariosQueryOptions } from '../api/queries';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { SOCIO } from '@/constants';
import type { AgendaItem, CreateAgendaPayload, UpdateAgendaPayload, AgendaUsuario } from '../api/types';

interface AgendaItemModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: AgendaItem | null;
  defaultDate?: string;
  onSave: (data: CreateAgendaPayload | (UpdateAgendaPayload & { id: number })) => void;
  onDelete: (id: number) => void;
}

type Tr = (key: string, fallback: string) => string;

export function AgendaItemModal({
  open,
  onOpenChange,
  item,
  defaultDate,
  onSave,
  onDelete,
}: AgendaItemModalProps) {
  const t = useT();
  const tr: Tr = (key, fallback) => t(key, { defaultValue: fallback });
  const [titulo, setTitulo] = useState('');
  const [fecha, setFecha] = useState<Date | undefined>(undefined);
  const [horaInicio, setHoraInicio] = useState('09:00');
  const [horaFin, setHoraFin] = useState('10:00');
  const [tipo, setTipo] = useState<'PERSONAL' | 'ESTUDIO' | 'TAREA'>('PERSONAL');
  const [descripcion, setDescripcion] = useState('');
  const [esEstudio, setEsEstudio] = useState(false);
  const [usuarioId, setUsuarioId] = useState('');

  const user = useAuthStore((s) => s.user);
  const isSocio = user?.role === SOCIO;
  // Only fetch the active users list when the modal is open.
  const { data: usuarios = [] } = useQuery({
    ...agendaUsuariosQueryOptions(),
    enabled: open,
  });

  const handleEsEstudioChange = useCallback((checked: boolean) => {
    setEsEstudio(checked);
    if (checked) {
      setTipo('ESTUDIO');
    }
  }, []);

  useEffect(() => {
    if (item) {
      setTitulo(item.titulo);
      setFecha(new Date(item.fecha.slice(0, 10) + 'T12:00:00'));
      setHoraInicio(item.fecha.slice(11, 16));
      const endDate = new Date(item.fecha);
      endDate.setMinutes(endDate.getMinutes() + item.duracionMin);
      setHoraFin(endDate.toISOString().slice(11, 16));
      setTipo(item.tipo as 'PERSONAL' | 'ESTUDIO' | 'TAREA');
      setDescripcion(item.descripcion ?? '');
      setEsEstudio(item.esEstudio ?? false);
    } else {
      setTitulo('');
      setFecha(new Date((defaultDate ?? new Date().toISOString().slice(0, 10)) + 'T12:00:00'));
      setHoraInicio('09:00');
      setHoraFin('10:00');
      setTipo('PERSONAL');
      setDescripcion('');
      setEsEstudio(false);
      setUsuarioId('');
    }
  }, [item, defaultDate, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fechaStr = fecha ? format(fecha, 'yyyy-MM-dd') : '';
    const fechaISO = new Date(`${fechaStr}T${horaInicio}:00`).toISOString();
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
        esEstudio,
      });
    } else {
      const payload: CreateAgendaPayload = {
        titulo,
        fecha: fechaISO,
        duracionMin,
        tipo,
        descripcion: descripcion || undefined,
        esEstudio,
      };
      if (isSocio && usuarioId && usuarioId !== user?.id) {
        payload.usuarioId = usuarioId;
      }
      onSave(payload);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {item ? tr('agenda.edit', 'Editar Evento') : tr('agenda.add', 'Nuevo Evento')}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="titulo">{tr('agenda.titulo', 'Título')}</Label>
            <Input
              id="titulo"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder={tr('agenda.placeholderTitulo', 'Nombre del evento')}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{tr('agenda.fecha', 'Fecha')}</Label>
              <DatePicker value={fecha} onChange={setFecha} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tipo">{tr('agenda.tipo', 'Tipo')}</Label>
              <Select value={tipo} onValueChange={(v: 'PERSONAL' | 'ESTUDIO' | 'TAREA') => setTipo(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PERSONAL">{tr('agenda.personal', 'Personal')}</SelectItem>
                  <SelectItem value="ESTUDIO">{tr('agenda.estudio', 'Estudio')}</SelectItem>
                  <SelectItem value="TAREA">{tr('agenda.tarea', 'Tarea')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{tr('agenda.horaInicio', 'Hora de comienzo')}</Label>
              <TimePicker value={horaInicio} onChange={setHoraInicio} />
            </div>
            <div className="space-y-2">
              <Label>{tr('agenda.horaFin', 'Hora de fin')}</Label>
              <TimePicker value={horaFin} onChange={setHoraFin} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">{tr('agenda.descripcion', 'Descripción')}</Label>
            <Textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder={tr('agenda.placeholderDescripcion', 'Descripción del evento (opcional)')}
              rows={3}
            />
          </div>

          {!item && isSocio && (
            <div className="space-y-2">
              <Label>{tr('agenda.asignarUsuario', 'Asignar a usuario')}</Label>
              <select
                value={usuarioId || user?.id || ''}
                onChange={(e) => setUsuarioId(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value={user?.id ?? ''}>
                  {user?.nombre ?? tr('common.me', 'Yo')} ({tr('agenda.me', 'yo')})
                </option>
                {(usuarios ?? [])
                  .filter((u: AgendaUsuario) => u.id !== user?.id)
                  .map((u: AgendaUsuario) => (
                    <option key={u.id} value={u.id}>
                      {u.nombre}
                    </option>
                  ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Checkbox
              id="esEstudio"
              checked={esEstudio}
              onCheckedChange={handleEsEstudioChange}
            />
            <Label htmlFor="esEstudio" className="text-sm cursor-pointer">
              {tr('agenda.compartirEstudio', 'Compartir con el estudio (visible para el equipo)')}
            </Label>
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
                {tr('common.delete', 'Eliminar')}
              </Button>
            )}
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              {tr('common.cancel', 'Cancelar')}
            </Button>
            <Button type="submit">
              {item ? tr('common.save', 'Guardar') : tr('common.create', 'Crear')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
