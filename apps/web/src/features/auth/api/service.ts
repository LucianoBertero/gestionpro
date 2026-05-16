import api from '@/lib/auth/axios-instance';
import type {
  LoginPayload,
  SignupPayload,
  AuthResponse,
  RefreshResponse,
  ActiveUser,
} from './types';
import type { User } from '@/types/auth';

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const { data: envelope } = await api.post('/v1/auth/login', payload);
  return envelope.data;
}

export async function signup(payload: SignupPayload): Promise<AuthResponse> {
  const { data: envelope } = await api.post('/v1/auth/signup', payload);
  return envelope.data;
}

export async function refreshToken(): Promise<RefreshResponse> {
  const { data: envelope } = await api.get('/v1/auth/refresh-token');
  return envelope.data;
}

export async function logout(): Promise<void> {
  await api.post('/v1/auth/logout');
}

export async function getActiveUsers(): Promise<ActiveUser[]> {
  const { data: envelope } = await api.get('/v1/auth/users');
  return envelope.data;
}

export async function getUserProfile(): Promise<User> {
  const { data: envelope } = await api.get('/v1/user/profile');
  return envelope.data;
}
