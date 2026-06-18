import api from '@/lib/auth/axios-instance';
import type {
  ClaveCliente,
  CreateClaveClientePayload,
  UpdateClaveClientePayload,
} from './types-clave-cliente';

export async function getClavesCliente(clienteId: number): Promise<ClaveCliente[]> {
  const { data } = await api.get(`/v1/clientes/${clienteId}/claves`);
  return data.data;
}

export async function createClaveCliente(
  clienteId: number,
  payload: CreateClaveClientePayload,
): Promise<ClaveCliente> {
  const { data } = await api.post(`/v1/clientes/${clienteId}/claves`, payload);
  return data.data;
}

export async function updateClaveCliente(
  clienteId: number,
  id: string,
  payload: UpdateClaveClientePayload,
): Promise<ClaveCliente> {
  const { data } = await api.patch(`/v1/clientes/${clienteId}/claves/${id}`, payload);
  return data.data;
}

export async function deleteClaveCliente(clienteId: number, id: string): Promise<void> {
  await api.delete(`/v1/clientes/${clienteId}/claves/${id}`);
}
