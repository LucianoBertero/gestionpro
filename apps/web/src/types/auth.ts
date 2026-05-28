import { type Rol } from '@/constants';

export interface User {
  id: string;
  email: string;
  nombre: string;
  emoji: string | null;
  role: Rol;
  activo: boolean;
}
