export type TipoTemplate = 'VENCIMIENTO' | 'LIQUIDACION' | 'RECORDATORIO' | 'GENERAL';

export interface EmailTemplate {
  id: number;
  estudioId: number;
  nombre: string;
  tipo: TipoTemplate;
  asunto: string;
  cuerpo: string;
  activo: boolean;
  creadoEn: string;
  actualizadoEn: string;
}

export interface CreateEmailTemplatePayload {
  nombre: string;
  tipo: TipoTemplate;
  asunto: string;
  cuerpo: string;
}

export interface UpdateEmailTemplatePayload {
  nombre?: string;
  tipo?: TipoTemplate;
  asunto?: string;
  cuerpo?: string;
  activo?: boolean;
}
