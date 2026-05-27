'use client';

import { useCallback, useMemo, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import esLocale from '@fullcalendar/core/locales/es';
import type { DateSelectArg, EventClickArg, EventContentArg } from '@fullcalendar/core';
import { useSuspenseQuery } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { agendaItemsQueryOptions, agendaKeys } from '../api/queries';
import { createAgendaItem, updateAgendaItem, deleteAgendaItem } from '../api/service';
import type { AgendaItem, CreateAgendaPayload, UpdateAgendaPayload } from '../api/types';
import { AgendaItemModal } from './agenda-item-modal';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';

function toCalendarEvent(item: AgendaItem) {
  const end = new Date(item.fecha);
  end.setMinutes(end.getMinutes() + item.duracionMin);
  return {
    id: String(item.id),
    title: item.titulo,
    start: item.fecha,
    end: end.toISOString(),
    backgroundColor:
      item.tipo === 'PERSONAL' ? '#3b82f6' :
      item.tipo === 'ESTUDIO' ? '#8b5cf6' :
      '#10b981',
    borderColor: 'transparent',
    textColor: '#fff',
    extendedProps: { item },
  };
}

export default function FullCalendarInnerWrapper() {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<AgendaItem | null>(null);

  const queryClient = useQueryClient();
  const { data: items } = useSuspenseQuery(agendaItemsQueryOptions());

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

function renderEventContent(eventContent: EventContentArg) {
  return (
    <div className="truncate px-1 text-xs font-medium">
      {eventContent.event.title}
    </div>
  );
}
