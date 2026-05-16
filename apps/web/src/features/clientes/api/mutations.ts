import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { createCliente, updateCliente, deleteCliente } from './service';
import { clientesKeys } from './queries';
import type { CreateClientePayload, UpdateClientePayload } from './types';

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
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: clientesKeys.all });
  },
});

export const deleteClienteMutation = mutationOptions({
  mutationFn: (id: number) => deleteCliente(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: clientesKeys.all });
  },
});
