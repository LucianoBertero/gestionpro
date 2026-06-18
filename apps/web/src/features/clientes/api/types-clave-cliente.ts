export interface ClaveCliente {
  id: string;
  clienteId: number;
  entidad: string;
  clave: string;
  creadoPorId: string;
  creadoEn: string;
}

export interface CreateClaveClientePayload {
  entidad: string;
  clave: string;
}

export interface UpdateClaveClientePayload {
  entidad?: string;
  clave?: string;
}
