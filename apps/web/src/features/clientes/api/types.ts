// ============================================================
// Clientes Types — Frontend
// ============================================================

export type TipoImpuesto =
  | 'AUTONOMOS'
  | 'IVA'
  | 'IIBB_LOCAL'
  | 'MUNICIPAL'
  | 'SUELDOS'
  | 'MONOTRIBUTO'
  | 'GANANCIAS';

export type EstadoSemaforo = 'VERDE' | 'AMARILLO' | 'ROJO';

export interface Cliente {
  id: number;
  estudioId: number;
  cuit: string;
  denominacion: string;
  termino: number;
  condicionIva: string;
  actividades: string[];
  domicilio: string | null;
  telefono: string | null;
  email: string | null;
  whatsapp: string | null;
  encargadoId: string;
  supervisorId: string | null;
  semaforo: EstadoSemaforo;
  activo: boolean;
  notas: string | null;
  creadoEn: string;
}

export interface ClienteImpuesto {
  id: number;
  tipo: TipoImpuesto;
  activo: boolean;
}

export interface ClienteLegajo extends Cliente {
  impuestos: ClienteImpuesto[];
  encargadoNombre: string;
  supervisorNombre: string | null;
}

export interface ClienteFilters {
  search?: string;
  semaforo?: string;
  encargadoId?: string;
  page?: number;
  limit?: number;
}

export interface CreateClientePayload {
  cuit: string;
  denominacion: string;
  condicionIva: string;
  encargadoId: string;
  termino?: number;
  actividades?: string[];
  domicilio?: string;
  telefono?: string;
  email?: string;
  whatsapp?: string;
  supervisorId?: string;
  notas?: string;
  tipoImpuesto: TipoImpuesto[];
}

export interface UpdateClientePayload {
  cuit?: string;
  denominacion?: string;
  condicionIva?: string;
  encargadoId?: string;
  termino?: number;
  actividades?: string[];
  domicilio?: string;
  telefono?: string;
  email?: string;
  whatsapp?: string;
  supervisorId?: string;
  notas?: string;
  semaforo?: EstadoSemaforo;
}

export interface AfipResponse {
  cuit: string;
  denominacion: string;
  domicilio: string;
  condicionIva: string;
  actividades: string[];
}
