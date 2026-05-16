'use client';

import { create } from 'zustand';
import { configureAuthInterceptors } from '@/lib/auth/axios-instance';
import type { AuthState } from './auth.types';
import type { User } from '@/types/auth';

export const useAuthStore = create<AuthState>((set, get) => {
  const authConfig = {
    getAccessToken: () => get().accessToken,
    onRefreshSuccess: (accessToken: string) => {
      set({ accessToken });
    },
    onRefreshFailure: () => {
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
      });
    },
  };

  configureAuthInterceptors(authConfig);

  return {
    user: null,
    accessToken: null,
    isLoading: false,
    isAuthenticated: false,
    isInitialized: false,

    login: async (email: string, password: string) => {
      set({ isLoading: true });
      try {
        const api = (await import('@/lib/auth/axios-instance')).default;
        const { data: envelope } = await api.post('/v1/auth/login', { email, password });

        const { accessToken, user } = envelope.data as {
          accessToken: string;
          user: User;
        };

        set({
          accessToken,
          user,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
        });
      } catch (_err) {
        set({ isLoading: false, isInitialized: true });
        throw new Error('Login failed');
      }
    },

    logout: async () => {
      try {
        const api = (await import('@/lib/auth/axios-instance')).default;
        await api.post('/v1/auth/logout');
      } finally {
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
        });
      }
    },

    refresh: async () => {
      set({ isLoading: true });
      try {
        const api = (await import('@/lib/auth/axios-instance')).default;
        const refreshResult = await api.get('/v1/auth/refresh-token');
        const { accessToken } = refreshResult.data.data as { accessToken: string };

        set({ accessToken });

        const profileResult = await api.get('/v1/user/profile');
        const user = profileResult.data.data as User;

        set({
          user,
          isAuthenticated: true,
          isLoading: false,
          isInitialized: true,
        });
      } catch (_err) {
        set({
          user: null,
          accessToken: null,
          isAuthenticated: false,
          isLoading: false,
          isInitialized: true,
        });
      }
    },

    setUser: (user: User) => {
      set({ user });
    },

    setAccessToken: (accessToken: string) => {
      set({ accessToken });
    },

    clearAuth: () => {
      set({
        user: null,
        accessToken: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
      });
    },
  };
});
