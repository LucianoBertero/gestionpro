import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { createAgendaItem, updateAgendaItem, deleteAgendaItem } from './service';
import { agendaKeys } from './queries';
import type { CreateAgendaPayload, UpdateAgendaPayload } from './types';

export const createAgendaItemMutation = mutationOptions({
  mutationFn: (data: CreateAgendaPayload) => createAgendaItem(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: agendaKeys.all });
  },
});

export const updateAgendaItemMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: number; values: UpdateAgendaPayload }) =>
    updateAgendaItem(id, values),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: agendaKeys.all });
  },
});

export const deleteAgendaItemMutation = mutationOptions({
  mutationFn: (id: number) => deleteAgendaItem(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: agendaKeys.all });
  },
});
