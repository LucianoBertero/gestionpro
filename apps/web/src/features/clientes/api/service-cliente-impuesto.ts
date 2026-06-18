import api from '@/lib/auth/axios-instance';
import type { TipoImpuesto } from '@/constants';
import type { ClienteImpuesto } from './types';

/**
 * Agrega (o reactiva) un impuesto para el cliente. SOCIO only.
 */
export async function addClienteImpuesto(
  clienteId: number,
  tipo: TipoImpuesto
): Promise<ClienteImpuesto> {
  const { data } = await api.post(`/v1/clientes/${clienteId}/impuestos`, { tipo });
  return data.data;
}

/**
 * Toggle activo/inactivo de un impuesto. SOCIO only.
 */
export async function toggleClienteImpuesto(
  clienteId: number,
  clienteImpuestoId: number,
  activo: boolean
): Promise<ClienteImpuesto> {
  const { data } = await api.patch(
    `/v1/clientes/${clienteId}/impuestos/${clienteImpuestoId}`,
    { activo }
  );
  return data.data;
}

/**
 * Soft-delete de un impuesto del cliente (preserva historial). SOCIO only.
 */
export async function removeClienteImpuesto(
  clienteId: number,
  clienteImpuestoId: number
): Promise<ClienteImpuesto> {
  const { data } = await api.delete(
    `/v1/clientes/${clienteId}/impuestos/${clienteImpuestoId}`
  );
  return data.data;
}
