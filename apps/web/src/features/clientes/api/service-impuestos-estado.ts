import api from '@/lib/auth/axios-instance';
import type {
  ImpuestoConEstado,
  LiquidacionHistorialItem,
} from './types-impuestos-estado';

export async function getImpuestosConEstado(
  clienteId: number
): Promise<ImpuestoConEstado[]> {
  const { data } = await api.get(
    `/v1/clientes/${clienteId}/impuestos/con-estado`
  );
  return data.data;
}

export async function marcarImpuestoPresentado(
  clienteId: number,
  clienteImpuestoId: number
): Promise<ImpuestoConEstado> {
  const { data } = await api.post(
    `/v1/clientes/${clienteId}/impuestos/${clienteImpuestoId}/marcar-presentado`
  );
  return data.data;
}

export async function getHistorialImpuesto(
  clienteId: number,
  clienteImpuestoId: number
): Promise<LiquidacionHistorialItem[]> {
  const { data } = await api.get(
    `/v1/clientes/${clienteId}/impuestos/${clienteImpuestoId}/historial`
  );
  return data.data;
}
