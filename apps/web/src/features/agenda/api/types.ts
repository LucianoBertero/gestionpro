export type TipoEvento = 'TAREA' | 'ESTUDIO' | 'PERSONAL';
export type OrigenEvento = 'SISTEMA' | 'MANUAL' | 'GOOGLE';

export interface AgendaItem {
  id: number;
  usuarioId: string;
  tareaId: number | null;
  titulo: string;
  descripcion: string | null;
  fecha: string;
  duracionMin: number;
  tipo: TipoEvento;
  origen: OrigenEvento;
  googleEventId: string | null;
  esEstudio: boolean;
  activo: boolean;
  creadoEn: string;
  actualizadoEn: string;
}

export interface AgendaFilters {
  fechaDesde?: string;
  fechaHasta?: string;
}

export interface CreateAgendaPayload {
  titulo: string;
  fecha: string;
  duracionMin: number;
  tipo: TipoEvento;
  descripcion?: string;
  tareaId?: number;
  esEstudio?: boolean;
}

export interface UpdateAgendaPayload {
  titulo?: string;
  fecha?: string;
  duracionMin?: number;
  tipo?: TipoEvento;
  descripcion?: string;
  esEstudio?: boolean;
}
