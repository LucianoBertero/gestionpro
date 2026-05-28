export interface User {
  id: string;
  email: string;
  nombre: string;
  emoji: string | null;
  role: 'SOCIO' | 'COLABORADOR';
  activo: boolean;
  telefono: string | null;
  createdAt: string;
}

export interface UserFilters {
  role?: string;
  search?: string;
}

export interface UsersResponse {
  data: User[];
  total: number;
}

export interface CreateUserPayload {
  email: string;
  nombre: string;
  password: string;
  role: 'SOCIO' | 'COLABORADOR';
  emoji?: string;
  telefono?: string;
}

export interface UpdateUserPayload {
  email?: string;
  nombre?: string;
  role?: 'SOCIO' | 'COLABORADOR';
  emoji?: string;
  telefono?: string;
}
