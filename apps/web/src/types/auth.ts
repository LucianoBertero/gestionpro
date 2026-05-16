export interface User {
  id: string;
  email: string;
  nombre: string;
  emoji: string | null;
  role: 'SOCIO' | 'COLABORADOR';
  activo: boolean;
}
