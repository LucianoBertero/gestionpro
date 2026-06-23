import { mutationOptions } from '@tanstack/react-query';
import { getQueryClient } from '@/lib/query-client';
import { createCliente, updateCliente, deleteCliente, createNota, updateNota, deleteNota, attachArchivoCliente, detachArchivoCliente } from './service';
import { clientesKeys, notasKeys, archivosClienteKeys } from './queries';
import { impuestosEstadoKeys } from './queries-impuestos-estado';
import type { CreateClientePayload, UpdateClientePayload, CreateNotaPayload, UpdateNotaPayload } from './types';

export const createClienteMutation = mutationOptions({
  mutationFn: (data: CreateClientePayload) => createCliente(data),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: clientesKeys.all, refetchType: 'active' });
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
    getQueryClient().invalidateQueries({ queryKey: clientesKeys.all, refetchType: 'active' });
    // Invalida también el legajo específico y el estado de impuestos
    getQueryClient().invalidateQueries({ queryKey: clientesKeys.legajo(variables.id), refetchType: 'active' });
    getQueryClient().invalidateQueries({ queryKey: impuestosEstadoKeys.byCliente(variables.id), refetchType: 'active' });
  },
});

export const deleteClienteMutation = mutationOptions({
  mutationFn: (id: number) => deleteCliente(id),
  onSuccess: () => {
    getQueryClient().invalidateQueries({ queryKey: clientesKeys.all, refetchType: 'active' });
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

// ─── Archivos ────────────────────────────────────────────────────────

export const attachArchivoClienteMutation = mutationOptions({
  mutationFn: ({ clienteId, archivoId, orden }: { clienteId: number; archivoId: number; orden?: number }) =>
    attachArchivoCliente(clienteId, archivoId, orden),
  onSuccess: (_data, variables) => {
    const qc = getQueryClient();
    qc.invalidateQueries({ queryKey: archivosClienteKeys.root });
    qc.invalidateQueries({ queryKey: clientesKeys.detail(variables.clienteId) });
  },
});

export const detachArchivoClienteMutation = mutationOptions({
  mutationFn: ({ clienteId, archivoId }: { clienteId: number; archivoId: number }) =>
    detachArchivoCliente(clienteId, archivoId),
  onSuccess: (_data, variables) => {
    const qc = getQueryClient();
    qc.invalidateQueries({ queryKey: archivosClienteKeys.root });
    qc.invalidateQueries({ queryKey: clientesKeys.detail(variables.clienteId) });
  },
});
