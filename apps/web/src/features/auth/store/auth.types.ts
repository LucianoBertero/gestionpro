import type { User } from '@/types/auth';

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  setUser: (user: User) => void;
  setAccessToken: (accessToken: string) => void;
  clearAuth: () => void;
}
