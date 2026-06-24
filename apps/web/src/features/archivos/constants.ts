import type { TipoArchivo } from './api/types';

export const TIPO_ARCHIVO_VALUES: TipoArchivo[] = [
  'COMPROBANTE',
  'DDJJ',
  'CONTRATO',
  'OTRO',
];

export const TIPO_ARCHIVO_LABELS: Record<TipoArchivo, string> = {
  COMPROBANTE: 'Comprobante',
  DDJJ: 'DDJJ',
  CONTRATO: 'Contrato',
  OTRO: 'Otro',
};

export const TIPO_ARCHIVO_BADGE: Record<TipoArchivo, string> = {
  COMPROBANTE: 'bg-green-100 text-green-800',
  DDJJ: 'bg-blue-100 text-blue-800',
  CONTRATO: 'bg-purple-100 text-purple-800',
  OTRO: 'bg-gray-100 text-gray-800',
};
