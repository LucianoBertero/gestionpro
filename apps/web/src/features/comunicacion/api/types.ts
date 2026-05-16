export interface Comunicacion {
  id: number;
  clienteId: number;
  usuarioId: string;
  tipo: string;
  asunto: string | null;
  contenido: string | null;
  creadoEn: string;
  usuario?: { id: string; nombre: string };
  cliente?: { id: number; denominacion: string };
}

export interface ComunicacionFilters {
  clienteId?: number;
  tipo?: string;
}

export interface CreateComunicacionPayload {
  clienteId: number;
  tipo: string;
  asunto?: string;
  contenido?: string;
}

export interface UpdateComunicacionPayload {
  tipo?: string;
  asunto?: string;
  contenido?: string;
}
