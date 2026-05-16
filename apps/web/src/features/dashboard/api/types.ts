export interface DashboardMetricas {
  totalClientes: number;
  tareasPendientes: number;
  tareasUrgentes: number;
  alertasSemaforo: number;
}

export interface SemaforosData {
  verde: number;
  amarillo: number;
  rojo: number;
}

export interface TareaColaborador {
  usuarioId: string;
  nombre: string;
  pendientes: number;
  alta: number;
}

export interface VencimientoSemana {
  id: number;
  titulo: string;
  vence: string | null;
  encargado: { id: string; nombre: string };
  cliente: { id: number; denominacion: string } | null;
}
