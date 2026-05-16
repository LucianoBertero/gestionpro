import api, { unwrap } from '@/lib/api/client';
import type {
  LoginPayload,
  SignupPayload,
  AuthResponse,
  RefreshResponse,
  ActiveUser,
} from './types';
import type { User } from '@/types/auth';

export async function login(payload: LoginPayload): Promise<AuthResponse> {
  const result = await api.POST('/v1/auth/login', { body: payload });
  return unwrap<AuthResponse>(result.data);
}

export async function signup(payload: SignupPayload): Promise<AuthResponse> {
  const result = await api.POST('/v1/auth/signup', { body: payload });
  return unwrap<AuthResponse>(result.data);
}

export async function refreshToken(): Promise<RefreshResponse> {
  const result = await api.GET('/v1/auth/refresh-token');
  return unwrap<RefreshResponse>(result.data);
}

export async function logout(): Promise<void> {
  await api.POST('/v1/auth/logout');
}

export async function getActiveUsers(): Promise<ActiveUser[]> {
  const result = await api.GET('/v1/auth/users');
  return unwrap<ActiveUser[]>(result.data);
}

export async function getUserProfile(): Promise<User> {
  const result = await api.GET('/v1/user/profile');
  return unwrap<User>(result.data);
}
