// ============================================================
// Tareas Types — Frontend
// ============================================================

import type { TipoTarea, Prioridad, EstadoTarea, TipoImpuesto } from '@/constants';

export interface TareaClienteMin {
  id: number;
  denominacion: string;
}

export interface TareaEncargadoMin {
  id: string;
  nombre: string;
}

export interface Tarea {
  id: number;
  estudioId: number;
  clienteId: number | null;
  encargadoId: string;
  titulo: string;
  descripcion: string | null;
  tipo: TipoTarea;
  impuesto: TipoImpuesto | null;
  periodo: string | null;
  tiempoEstMin: number | null;
  prioridad: Prioridad;
  estado: EstadoTarea;
  vence: string | null;
  esRecurrente: boolean;
  reglaRecur: Record<string, unknown> | null;
  notas: string | null;
  activo: boolean;
  creadoEn: string;
  actualizadoEn: string;
  cliente: TareaClienteMin | null;
  encargado: TareaEncargadoMin;
}

export interface TareaFilters {
  search?: string;
  estado?: EstadoTarea;
  prioridad?: Prioridad;
  encargadoId?: string;
  clienteId?: number;
  page?: number;
  limit?: number;
}

export interface CreateTareaPayload {
  clienteId?: number;
  encargadoId: string;
  titulo: string;
  descripcion?: string;
  tipo: TipoTarea;
  impuesto?: TipoImpuesto;
  periodo?: string;
  tiempoEstMin?: number;
  prioridad?: Prioridad;
  vence?: string;
  esRecurrente?: boolean;
  reglaRecur?: Record<string, unknown>;
  notas?: string;
}

export interface UpdateTareaPayload {
  clienteId?: number;
  encargadoId?: string;
  titulo?: string;
  descripcion?: string;
  tipo?: TipoTarea;
  impuesto?: TipoImpuesto;
  periodo?: string;
  tiempoEstMin?: number;
  prioridad?: Prioridad;
  estado?: EstadoTarea;
  vence?: string;
  esRecurrente?: boolean;
  reglaRecur?: Record<string, unknown>;
  notas?: string;
}
