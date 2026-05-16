import type { User } from '@/types/auth';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface SignupPayload {
  nombre: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken?: string;
  user?: User;
}

export interface RefreshResponse {
  accessToken: string;
}

export interface ActiveUser {
  id: string;
  nombre: string;
  emoji: string | null;
  email: string;
}
