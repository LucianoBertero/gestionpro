import api from '@/lib/auth/axios-instance';
import type {
  Cliente,
  ClienteLegajo,
  ClienteFilters,
  CreateClientePayload,
  UpdateClientePayload,
  AfipResponse,
} from './types';

export async function getClientes(
  filters: ClienteFilters
): Promise<{ data: Cliente[]; total: number }> {
  const { data } = await api.get('/v1/clientes', {
    params: { search: filters.search, semaforo: filters.semaforo, encargadoId: filters.encargadoId, skip: 0, take: 1000 }
  });
  return { data: data.data, total: data.data.length };
}

export async function getCliente(id: number): Promise<Cliente> {
  const { data } = await api.get(`/v1/clientes/${id}`);
  return data.data;
}

export async function getLegajo(id: number): Promise<ClienteLegajo> {
  const { data } = await api.get(`/v1/clientes/${id}/legajo`);
  return data.data;
}

export async function createCliente(payload: CreateClientePayload): Promise<Cliente> {
  const { data } = await api.post('/v1/clientes', payload);
  return data.data;
}

export async function updateCliente(id: number, payload: UpdateClientePayload): Promise<Cliente> {
  const { data } = await api.patch(`/v1/clientes/${id}`, payload);
  return data.data;
}

export async function deleteCliente(id: number): Promise<void> {
  await api.delete(`/v1/clientes/${id}`);
}

export async function buscarAfip(cuit: string): Promise<AfipResponse> {
  const { data } = await api.get(`/v1/clientes/afip/${cuit}`);
  return data.data;
}
