export type TipoNotificacion = 'VENCIMIENTO' | 'TAREA' | 'SISTEMA';

export interface Notificacion {
  id: number;
  usuarioId: string;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  leida: boolean;
  enlace: string | null;
  creadoEn: string;
}

export interface NotificacionesResponse {
  data: Notificacion[];
  meta: {
    total: number;
    noLeidas: number;
  };
}
