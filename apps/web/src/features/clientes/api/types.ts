// ============================================================
// Clientes Types — Frontend
// ============================================================

import { TipoImpuesto, EstadoSemaforo } from '@/constants';

// Re-export for convenience — existing consumers import from here
export type { TipoImpuesto, EstadoSemaforo };

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
  honorarioMensual: number | null;
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
  skip?: number;
  take?: number;
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
  honorarioMensual?: number;
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
  semaforo?: EstadoSemaforo;
}

export interface AfipResponse {
  cuit: string;
  denominacion: string;
  domicilio: string;
  condicionIva: string;
  actividades: string[];
}

// ─── Notas ────────────────────────────────────────────────────────────

export interface NotaCreador {
  id: string;
  nombre: string;
  emoji: string | null;
}

export interface Nota {
  id: number;
  clienteId: number;
  contenido: string;
  creadoPorId: string;
  creadoEn: string;
  actualizadoEn: string;
  creadoPor: NotaCreador;
}

export interface CreateNotaPayload {
  clienteId: number;
  contenido: string;
}

export interface UpdateNotaPayload {
  contenido: string;
}

// ─── Archivos ───────────────────────────────────────────────────────

/**
 * Shape of an item returned by `GET /v1/clientes/:id/archivos`.
 * The backend includes the nested `archivo` row (full metadata, NO signedUrl —
 * signed URLs are generated on demand via `GET /v1/archivos/:id`).
 */
export interface ClienteArchivoListItem {
  clienteId: number;
  archivoId: number;
  orden: number;
  archivo: {
    id: number;
    storageKey: string;
    mimeType: string;
    extension: string;
    bytes: number;
    originalName: string;
    tipo: 'COMPROBANTE' | 'DDJJ' | 'CONTRATO' | 'OTRO';
    periodo: string | null;
    parent: {
      type: 'cliente' | 'tarea' | 'liquidacion';
      id: number;
    };
    subidoPorId: string;
    activo: boolean;
    creadoEn: string;
    /** Signed URL for direct download — present when backend W10 is deployed. */
    signedUrl?: string | null;
    downloadUrl?: string | null;
  };
}
