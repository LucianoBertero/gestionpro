export interface Clave {
  id: string;
  entidad: string;
  clave: string;
  creadoPorId: string;
  creadoEn: string;
}

export interface CreateClavePayload {
  entidad: string;
  clave: string;
}

export interface UpdateClavePayload {
  entidad?: string;
  clave?: string;
}
