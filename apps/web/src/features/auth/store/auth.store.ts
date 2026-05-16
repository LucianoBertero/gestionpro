'use client';

import { create } from 'zustand';
import api, { configureApiAuth, unwrap } from '@/lib/api/client';
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

  configureApiAuth(authConfig);
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
        const result = await api.POST('/v1/auth/login', {
          body: { email, password },
        });

        const { accessToken, user } = unwrap<{
          accessToken: string;
          user: User;
        }>(result.data);

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
        await api.POST('/v1/auth/logout');
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
        const refreshResult = await api.GET('/v1/auth/refresh-token');
        const { accessToken } = unwrap<{ accessToken: string }>(
          refreshResult.data
        );

        set({ accessToken });

        const profileResult = await api.GET('/v1/user/profile');
        const user = unwrap<User>(profileResult.data);

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
