import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { createCliente, updateCliente, deleteCliente, createNota, updateNota, deleteNota } from './service';
import { clientesKeys, notasKeys } from './queries';
import { impuestosEstadoKeys } from './queries-impuestos-estado';
import type { CreateClientePayload, UpdateClientePayload, CreateNotaPayload, UpdateNotaPayload } from './types';

export const createClienteMutation = mutationOptions({
  mutationFn: (data: CreateClientePayload) => createCliente(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: clientesKeys.all });
  },
});

export const updateClienteMutation = mutationOptions({
  mutationFn: ({
    id,
    values,
  }: {
    id: number;
    values: UpdateClientePayload;
  }) => updateCliente(id, values),
  onSuccess: (_data, variables) => {
    getQueryClient().invalidateQueries({ queryKey: clientesKeys.all });
    // Invalida también el legajo específico y el estado de impuestos
    getQueryClient().invalidateQueries({ queryKey: clientesKeys.legajo(variables.id) });
    getQueryClient().invalidateQueries({ queryKey: impuestosEstadoKeys.byCliente(variables.id) });
  },
});

export const deleteClienteMutation = mutationOptions({
  mutationFn: (id: number) => deleteCliente(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: clientesKeys.all });
  },
});

// ─── Notas ────────────────────────────────────────────────────────────

export const createNotaMutation = mutationOptions({
  mutationFn: (data: CreateNotaPayload) => createNota(data),
  onSuccess: (_data, variables) => {
    getQueryClient().invalidateQueries({ queryKey: notasKeys.byCliente(variables.clienteId) });
  },
});

export const updateNotaMutation = mutationOptions({
  mutationFn: ({ id, values }: { id: number; values: UpdateNotaPayload; clienteId: number }) =>
    updateNota(id, values),
  onSuccess: (_data, variables) => {
    getQueryClient().invalidateQueries({ queryKey: notasKeys.byCliente(variables.clienteId) });
  },
});

export const deleteNotaMutation = mutationOptions({
  mutationFn: ({ id, clienteId }: { id: number; clienteId: number }) => deleteNota(id),
  onSuccess: (_data, variables) => {
    getQueryClient().invalidateQueries({ queryKey: notasKeys.byCliente(variables.clienteId) });
  },
});
