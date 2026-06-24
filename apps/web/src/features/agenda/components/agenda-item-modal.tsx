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

type RecurrenceFreq = 'none' | 'DAILY' | 'WEEKLY' | 'MONTHLY';

const DAY_CODES = ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'] as const;

const DAY_I18N_KEYS: Record<string, string> = {
  MO: 'agenda.recurrence.byDay.monday',
  TU: 'agenda.recurrence.byDay.tuesday',
  WE: 'agenda.recurrence.byDay.wednesday',
  TH: 'agenda.recurrence.byDay.thursday',
  FR: 'agenda.recurrence.byDay.friday',
  SA: 'agenda.recurrence.byDay.saturday',
  SU: 'agenda.recurrence.byDay.sunday',
};

function buildRrule(freq: string, interval: number, byDay: string[], until: string | null): string {
  let rule = `FREQ=${freq}`;
  if (interval > 1) rule += `;INTERVAL=${interval}`;
  if (byDay.length > 0) rule += `;BYDAY=${byDay.join(',')}`;
  if (until) {
    const d = new Date(until);
    const y = d.getUTCFullYear();
    const mn = String(d.getUTCMonth() + 1).padStart(2, '0');
    const dy = String(d.getUTCDate()).padStart(2, '0');
    rule += `;UNTIL=${y}${mn}${dy}T235959Z`;
  }
  return rule;
}

function parseRrule(rule: string | null | undefined): {
  freq: RecurrenceFreq;
  interval: number;
  byDay: string[];
  until: string | null;
} {
  if (!rule) return { freq: 'none', interval: 1, byDay: [], until: null };
  const parts = rule.split(';');
  const freqRaw = parts[0]?.replace('FREQ=', '') ?? '';
  const freq: RecurrenceFreq =
    freqRaw === 'DAILY' || freqRaw === 'WEEKLY' || freqRaw === 'MONTHLY'
      ? (freqRaw as RecurrenceFreq)
      : 'none';
  const interval = parseInt(parts.find((p) => p.startsWith('INTERVAL='))?.replace('INTERVAL=', '') ?? '1', 10) || 1;
  const byDayStr = parts.find((p) => p.startsWith('BYDAY='))?.replace('BYDAY=', '') ?? '';
  const byDay = byDayStr ? byDayStr.split(',') : [];
  const untilStr = parts.find((p) => p.startsWith('UNTIL='))?.replace('UNTIL=', '') ?? null;
  let until: string | null = null;
  if (untilStr) {
    // Format: YYYYMMDDTHHmmssZ → convert to ISO date string
    until = `${untilStr.slice(0, 4)}-${untilStr.slice(4, 6)}-${untilStr.slice(6, 8)}`;
  }
  return { freq, interval, byDay, until };
}

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
  const [fechaFin, setFechaFin] = useState<Date | undefined>(undefined);
  const [allDay, setAllDay] = useState(false);
  const [multiDay, setMultiDay] = useState(false);
  const [horaInicio, setHoraInicio] = useState('09:00');
  const [horaFin, setHoraFin] = useState('10:00');
  const [tipo, setTipo] = useState<'PERSONAL' | 'ESTUDIO' | 'TAREA'>('PERSONAL');
  const [descripcion, setDescripcion] = useState('');
  const [esEstudio, setEsEstudio] = useState(false);
  const [usuarioId, setUsuarioId] = useState('');

  // Recurrence state
  const [recurrenceFreq, setRecurrenceFreq] = useState<RecurrenceFreq>('none');
  const [recurrenceInterval, setRecurrenceInterval] = useState(1);
  const [recurrenceByDay, setRecurrenceByDay] = useState<string[]>([]);
  const [recurrenceUntil, setRecurrenceUntil] = useState<Date | undefined>(undefined);

  const user = useAuthStore((s) => s.user);
  const isSocio = user?.role === SOCIO;
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

  const toggleByDay = useCallback((day: string) => {
    setRecurrenceByDay((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day],
    );
  }, []);

  useEffect(() => {
    if (item) {
      setTitulo(item.titulo);
      const startDate = new Date(item.fecha);
      setFecha(new Date(startDate.getTime() + startDate.getTimezoneOffset() * 60000));
      // Hora from ISO string: yyyy-MM-dd'T'HH:mm:ss.sssZ → extract HH:mm
      const timeMatch = item.fecha.match(/T(\d{2}:\d{2})/);
      setHoraInicio(timeMatch?.[1] ?? '09:00');

      if (item.allDay) {
        setAllDay(true);
      } else {
        setAllDay(false);
        const endDate = new Date(startDate.getTime() + item.duracionMin * 60000);
        setHoraFin(endDate.toISOString().slice(11, 16));
      }

      if (item.fechaFin) {
        setFechaFin(new Date(item.fechaFin));
        setMultiDay(true);
      } else {
        setFechaFin(undefined);
        setMultiDay(false);
      }

      setTipo(item.tipo as 'PERSONAL' | 'ESTUDIO' | 'TAREA');
      setDescripcion(item.descripcion ?? '');
      setEsEstudio(item.esEstudio ?? false);

      // Recurrence
      const parsed = parseRrule(item.recurrenceRule);
      setRecurrenceFreq(parsed.freq);
      setRecurrenceInterval(parsed.interval);
      setRecurrenceByDay(parsed.byDay);
      setRecurrenceUntil(parsed.until ? new Date(parsed.until + 'T12:00:00') : undefined);
    } else {
      setTitulo('');
      const defaultD = defaultDate ?? new Date().toISOString().slice(0, 10);
      setFecha(new Date(defaultD + 'T12:00:00'));
      setFechaFin(undefined);
      setAllDay(false);
      setMultiDay(false);
      setHoraInicio('09:00');
      setHoraFin('10:00');
      setTipo('PERSONAL');
      setDescripcion('');
      setEsEstudio(false);
      setUsuarioId('');
      setRecurrenceFreq('none');
      setRecurrenceInterval(1);
      setRecurrenceByDay([]);
      setRecurrenceUntil(undefined);
    }
  }, [item, defaultDate, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fechaStr = fecha ? format(fecha, 'yyyy-MM-dd') : '';
    let fechaISO: string;
    let duracionMin: number;

    if (allDay) {
      fechaISO = new Date(fechaStr + 'T00:00:00.000Z').toISOString();
      duracionMin = 0;
    } else {
      fechaISO = new Date(`${fechaStr}T${horaInicio}:00`).toISOString();
      const [hFin, mFin] = horaFin.split(':').map(Number);
      const [hInicio, mInicio] = horaInicio.split(':').map(Number);
      duracionMin = Math.max(15, hFin * 60 + mFin - (hInicio * 60 + mInicio));
    }

    // Build recurrence fields
    let recurrenceRule: string | undefined;
    let recurrenceEnd: string | undefined;
    if (recurrenceFreq !== 'none') {
      recurrenceRule = buildRrule(
        recurrenceFreq,
        recurrenceInterval,
        recurrenceByDay,
        recurrenceUntil ? format(recurrenceUntil, 'yyyy-MM-dd') : null,
      );
      if (recurrenceUntil) {
        recurrenceEnd = new Date(format(recurrenceUntil, 'yyyy-MM-dd') + 'T23:59:59.999Z').toISOString();
      }
    }

    const basePayload = {
      titulo,
      fecha: fechaISO,
      duracionMin,
      tipo,
      descripcion: descripcion || undefined,
      esEstudio,
      fechaFin: multiDay && fechaFin ? fechaFin.toISOString() : undefined,
      allDay,
      recurrenceRule: recurrenceRule || undefined,
      recurrenceEnd: recurrenceEnd || undefined,
    };

    if (item) {
      onSave({
        id: item.id,
        ...basePayload,
      });
    } else {
      const payload: CreateAgendaPayload = { ...basePayload };
      if (isSocio && usuarioId && usuarioId !== user?.id) {
        payload.usuarioId = usuarioId;
      }
      onSave(payload);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {item ? tr('agenda.edit', 'Editar Evento') : tr('agenda.add', 'Nuevo Evento')}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* ── Básico ───────────────────────────────────────────────────── */}
          <fieldset className="space-y-3 rounded-md border p-3">
            <legend className="px-1 text-sm font-medium">
              {tr('agenda.section.basic', 'Información básica')}
            </legend>
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
            <div className="space-y-2">
              <Label htmlFor="descripcion">{tr('agenda.descripcion', 'Descripción')}</Label>
              <Textarea
                id="descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder={tr('agenda.placeholderDescripcion', 'Descripción del evento (opcional)')}
                rows={2}
              />
            </div>
          </fieldset>

          {/* ── Cuándo ───────────────────────────────────────────────────── */}
          <fieldset className="space-y-3 rounded-md border p-3">
            <legend className="px-1 text-sm font-medium">
              {tr('agenda.section.when', 'Cuándo')}
            </legend>
            <div className="space-y-2">
              <Label>{tr('agenda.fecha', 'Fecha')}</Label>
              <DatePicker value={fecha} onChange={setFecha} />
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="multiDay"
                checked={multiDay}
                onCheckedChange={(checked) => setMultiDay(checked === true)}
              />
              <Label htmlFor="multiDay" className="text-sm cursor-pointer">
                {tr('agenda.multiDay.label', 'Evento de varios días')}
              </Label>
            </div>
            {multiDay && (
              <div className="space-y-2">
                <Label>{tr('agenda.multiDay.endDate', 'Fecha de fin')}</Label>
                <DatePicker value={fechaFin} onChange={setFechaFin} />
              </div>
            )}
            <div className="flex items-center gap-2">
              <Checkbox
                id="allDay"
                checked={allDay}
                onCheckedChange={(checked) => setAllDay(checked === true)}
              />
              <Label htmlFor="allDay" className="text-sm cursor-pointer">
                {tr('agenda.allDay', 'Día completo')}
              </Label>
            </div>
            {!allDay && (
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
            )}
          </fieldset>

          {/* ── Quién ────────────────────────────────────────────────────── */}
          <fieldset className="space-y-3 rounded-md border p-3">
            <legend className="px-1 text-sm font-medium">
              {tr('agenda.section.who', 'Quién')}
            </legend>
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
          </fieldset>

          {/* ── Repetición ────────────────────────────────────────────────── */}
          <fieldset className="space-y-3 rounded-md border p-3">
            <legend className="px-1 text-sm font-medium">
              {tr('agenda.recurrence.label', 'Repetición')}
            </legend>
            <Select
              value={recurrenceFreq}
              onValueChange={(v) => {
                setRecurrenceFreq(v as RecurrenceFreq);
                if (v === 'none') {
                  setRecurrenceByDay([]);
                  setRecurrenceUntil(undefined);
                }
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">{tr('agenda.recurrence.none', 'No se repite')}</SelectItem>
                <SelectItem value="DAILY">{tr('agenda.recurrence.daily', 'Diariamente')}</SelectItem>
                <SelectItem value="WEEKLY">{tr('agenda.recurrence.weekly', 'Semanalmente')}</SelectItem>
                <SelectItem value="MONTHLY">{tr('agenda.recurrence.monthly', 'Mensualmente')}</SelectItem>
              </SelectContent>
            </Select>

            {recurrenceFreq !== 'none' && (
              <>
                <div className="flex items-center gap-2">
                  <Label className="text-sm whitespace-nowrap">
                    {tr('agenda.recurrence.interval', 'Cada')}
                  </Label>
                  <Input
                    type="number"
                    min={1}
                    max={99}
                    value={recurrenceInterval}
                    onChange={(e) => setRecurrenceInterval(Math.max(1, parseInt(e.target.value, 10) || 1))}
                    className="w-20"
                  />
                  <span className="text-sm text-muted-foreground">
                    {recurrenceFreq === 'DAILY'
                      ? tr('agenda.recurrence.intervalUnit.day', 'día(s)')
                      : recurrenceFreq === 'WEEKLY'
                        ? tr('agenda.recurrence.intervalUnit.week', 'semana(s)')
                        : tr('agenda.recurrence.intervalUnit.month', 'mes(es)')}
                  </span>
                </div>

                {recurrenceFreq === 'WEEKLY' && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">
                      {tr('agenda.recurrence.byDay.label', 'Días')}
                    </Label>
                    <div className="flex gap-1 flex-wrap">
                      {DAY_CODES.map((code) => (
                        <button
                          key={code}
                          type="button"
                          onClick={() => toggleByDay(code)}
                          className={`px-2 py-1 text-xs rounded-md border transition-colors ${
                            recurrenceByDay.includes(code)
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-background hover:bg-muted'
                          }`}
                        >
                          {tr(DAY_I18N_KEYS[code], code)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">
                    {tr('agenda.recurrence.endDate', 'Repetir hasta')}
                  </Label>
                  <DatePicker
                    value={recurrenceUntil}
                    onChange={setRecurrenceUntil}
                    placeholder={tr('agenda.recurrence.endDateRequired', 'Indicá una fecha de fin')}
                  />
                </div>
              </>
            )}
          </fieldset>

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
