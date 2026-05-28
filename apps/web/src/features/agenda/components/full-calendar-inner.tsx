'use client';

import { useCallback, useMemo, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import type { DateSelectArg, EventClickArg, EventContentArg } from '@fullcalendar/core';
import { useSuspenseQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  agendaItemsQueryOptions,
  agendaKeys,
  equipoAgendaQueryOptions,
  agendaUsuariosQueryOptions,
} from '../api/queries';
import { createAgendaItem, updateAgendaItem, deleteAgendaItem } from '../api/service';
import type {
  AgendaItem,
  AgendaItemWithUsuario,
  AgendaUsuario,
  CreateAgendaPayload,
  UpdateAgendaPayload,
} from '../api/types';
import { AgendaItemModal } from './agenda-item-modal';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { useAuthStore } from '@/features/auth/store/auth.store';
import { SOCIO } from '@/constants';
import { getUserColor, getUserInitials } from '@/lib/user-colors';

function toCalendarEvent(item: AgendaItem) {
  const end = new Date(item.fecha);
  end.setMinutes(end.getMinutes() + item.duracionMin);
  const itemWithUser = item as AgendaItemWithUsuario;
  const userColor = getUserColor(item.usuarioId);
  const userInitials = getUserInitials(itemWithUser.usuario?.nombre ?? '??');
  return {
    id: String(item.id),
    title: item.titulo,
    start: item.fecha,
    end: end.toISOString(),
    backgroundColor:
      item.tipo === 'PERSONAL' ? '#3b82f6' :
      item.tipo === 'ESTUDIO' ? '#8b5cf6' :
      '#10b981',
    borderColor: userColor,
    textColor: '#fff',
    extendedProps: { item, userColor, userInitials },
  };
}

export default function FullCalendarInnerWrapper() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<AgendaItem | null>(null);
  const [viewMode, setViewMode] = useState<'estudio' | 'personal'>('estudio');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);
  const isSocio = user?.role === SOCIO;

  const { data: usuarios } = useSuspenseQuery(agendaUsuariosQueryOptions());

  const queryOptions:
    | ReturnType<typeof equipoAgendaQueryOptions>
    | ReturnType<typeof agendaItemsQueryOptions> =
    viewMode === 'estudio'
      ? equipoAgendaQueryOptions({
          fechaDesde: dateRange.start || undefined,
          fechaHasta: dateRange.end || undefined,
        })
      : isSocio && selectedUserId
        ? equipoAgendaQueryOptions({
            usuarioId: selectedUserId,
            fechaDesde: dateRange.start || undefined,
            fechaHasta: dateRange.end || undefined,
          })
        : agendaItemsQueryOptions();

  const { data: items } = useSuspenseQuery(queryOptions as ReturnType<typeof equipoAgendaQueryOptions>);

  const events = useMemo(() => (items ?? []).map(toCalendarEvent), [items]);

  const createMutation = useMutation({
    mutationFn: (payload: CreateAgendaPayload) => createAgendaItem(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: agendaKeys.all }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: number; values: UpdateAgendaPayload }) =>
      updateAgendaItem(id, values),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: agendaKeys.all }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => deleteAgendaItem(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: agendaKeys.all }),
  });

  const handleDateSelect = useCallback((selectInfo: DateSelectArg) => {
    setSelectedDate(selectInfo.startStr);
    setEditingItem(null);
    setModalOpen(true);
  }, []);

  const handleEventClick = useCallback((clickInfo: EventClickArg) => {
    const item = (clickInfo.event.extendedProps as { item: AgendaItem }).item;
    setEditingItem(item);
    setSelectedDate(null);
    setModalOpen(true);
  }, []);

  const handleSave = useCallback(
    (data: CreateAgendaPayload | (UpdateAgendaPayload & { id: number })) => {
      if ('id' in data) {
        const { id, ...values } = data;
        updateMutation.mutate({ id, values });
      } else {
        createMutation.mutate(data);
      }
      setModalOpen(false);
      setEditingItem(null);
      setSelectedDate(null);
    },
    [createMutation, updateMutation],
  );

  const handleDelete = useCallback(
    (id: number) => {
      deleteMutation.mutate(id);
      setModalOpen(false);
      setEditingItem(null);
    },
    [deleteMutation],
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Calendario</h2>
        <Button onClick={() => { setEditingItem(null); setSelectedDate(null); setModalOpen(true); }}>
          <Icons.add className="mr-2 h-4 w-4" />
          Nuevo Evento
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex rounded-md border bg-card">
          <button
            onClick={() => setViewMode('estudio')}
            className={`px-3 py-1 text-sm rounded-l-md transition-colors ${
              viewMode === 'estudio'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            }`}
          >
            Estudio
          </button>
          <button
            onClick={() => setViewMode('personal')}
            className={`px-3 py-1 text-sm rounded-r-md transition-colors ${
              viewMode === 'personal'
                ? 'bg-primary text-primary-foreground'
                : 'hover:bg-muted'
            }`}
          >
            Personal
          </button>
        </div>
        {viewMode === 'personal' && (
          <UserSwitcherDropdown
            usuarios={usuarios ?? []}
            selectedUserId={selectedUserId}
            currentUserId={user?.id ?? ''}
            onUserChange={(id) => setSelectedUserId(id)}
            visibleFor={isSocio}
          />
        )}
        <span className="text-xs text-muted-foreground ml-auto">
          {(items ?? []).length} eventos
        </span>
      </div>

      <div className="rounded-lg border bg-card p-4">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          initialView="dayGridMonth"
          editable={false}
          selectable={true}
          selectMirror={true}
          dayMaxEvents={3}
          weekends={true}
          events={events}
          select={handleDateSelect}
          eventClick={handleEventClick}
          eventContent={renderEventContent}
          height="auto"
          locale={esLocale}
          datesSet={(dateInfo) => {
            setDateRange({ start: dateInfo.startStr, end: dateInfo.endStr });
          }}
          buttonText={{
            today: 'Hoy',
            month: 'Mes',
            week: 'Semana',
            day: 'Día',
          }}
        />
      </div>

      {modalOpen && (
        <AgendaItemModal
          open={modalOpen}
          onOpenChange={(open) => { setModalOpen(open); if (!open) { setEditingItem(null); setSelectedDate(null); } }}
          item={editingItem}
          defaultDate={selectedDate ?? undefined}
          onSave={handleSave}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}

function UserSwitcherDropdown({
  usuarios,
  selectedUserId,
  currentUserId,
  onUserChange,
  visibleFor,
}: {
  usuarios: AgendaUsuario[];
  selectedUserId: string | null;
  currentUserId: string;
  onUserChange: (id: string | null) => void;
  visibleFor: boolean;
}) {
  if (!visibleFor) return null;
  return (
    <select
      value={selectedUserId ?? ''}
      onChange={(e) => onUserChange(e.target.value || null)}
      className="h-8 rounded-md border bg-background px-2 text-sm"
    >
      <option value="">Mi Agenda</option>
      {usuarios
        .filter((u) => u.id !== currentUserId)
        .map((u) => (
          <option key={u.id} value={u.id}>
            {u.nombre}
          </option>
        ))}
    </select>
  );
}

function renderEventContent(eventContent: EventContentArg) {
  const { userColor, userInitials } = eventContent.event.extendedProps as any;
  return (
    <div className="flex items-center gap-1 px-1">
      <span
        className="inline-flex h-4 w-4 min-w-4 items-center justify-center rounded-full text-[9px] font-bold"
        style={{ backgroundColor: userColor, color: '#fff' }}
      >
        {userInitials}
      </span>
      <span className="truncate text-xs font-medium">{eventContent.event.title}</span>
    </div>
  );
}
