import api from '@/lib/auth/axios-instance';

export async function importClientesExcel(file: File) {
  const form = new FormData();
  form.append('file', file);
  const { data } = await api.post('/v1/admin/excel/import/clientes', form);
  return data.data;
}

export async function importComprobantesExcel(file: File) {
  const form = new FormData();
  form.append('file', file);
  const { data } = await api.post('/v1/admin/excel/import/comprobantes', form);
  return data.data;
}

export function getExportUrl(type: 'clientes' | 'tareas' | 'liquidaciones' | 'vencimientos', clienteId?: number) {
  let url = `${process.env.NEXT_PUBLIC_API_URL}/excel/export/${type}`;
  if (clienteId) url += `?clienteId=${clienteId}`;
  return url;
}

export async function downloadExcel(type: 'clientes' | 'tareas' | 'liquidaciones' | 'vencimientos', clienteId?: number) {
  const url = getExportUrl(type, clienteId);
  window.open(url, '_blank');
}
