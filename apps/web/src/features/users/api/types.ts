export interface User {
  id: string;
  email: string;
  nombre: string;
  emoji: string | null;
  rol: 'SOCIO' | 'COLABORADOR';
  activo: boolean;
  telefono: string | null;
  creadoEn: string;
}

export interface UserFilters {
  rol?: string;
  search?: string;
}

export interface UsersResponse {
  data: User[];
  total: number;
}

export interface UserMutationPayload {
  email: string;
  nombre: string;
  password: string;
  emoji?: string;
  telefono?: string;
}
