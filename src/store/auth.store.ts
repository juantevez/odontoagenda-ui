import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { iamApi } from '../api/iam.api';
import { extractErrorMessage } from '../utils/errors';
import type { User, AuthTokens, LoginCredentials, RegisterData } from '../types/user.types';

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: (globalLogout?: boolean) => Promise<void>;
  refreshToken: () => Promise<void>;
  loadUser: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (credentials) => {
        set({ isLoading: true, error: null });
        try {
          const tokens = await iamApi.login(credentials);
          localStorage.setItem('access_token', tokens.access_token);
          localStorage.setItem('refresh_token', tokens.refresh_token);
          const user = await iamApi.getCurrentUser();
          localStorage.setItem('user_id', user.user_id);
          set({ tokens, user, isAuthenticated: true, isLoading: false });
        } catch (error: unknown) {
          const msg = extractErrorMessage(error, 'Error al iniciar sesión');
          set({ error: msg, isLoading: false });
          throw error;
        }
      },

      register: async (data) => {
        set({ isLoading: true, error: null });
        try {
          await iamApi.register(data);
          set({ isLoading: false });
        } catch (error: unknown) {
          const msg = extractErrorMessage(error, 'Error al registrar');
          set({ error: msg, isLoading: false });
          throw error;
        }
      },

      logout: async (globalLogout = false) => {
        try {
          await iamApi.logout({
            refresh_token: get().tokens?.refresh_token,
            global_logout: globalLogout,
          });
        } finally {
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_id');
          set({ user: null, tokens: null, isAuthenticated: false });
        }
      },

      refreshToken: async () => {
        const refreshToken = localStorage.getItem('refresh_token');
        const userId = localStorage.getItem('user_id');
        if (!refreshToken || !userId) {
          await get().logout();
          return;
        }
        try {
          const tokens = await iamApi.refreshToken(refreshToken, userId);
          localStorage.setItem('access_token', tokens.access_token);
          localStorage.setItem('refresh_token', tokens.refresh_token);
          set({ tokens });
        } catch {
          await get().logout();
        }
      },

      loadUser: async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
          set({ isAuthenticated: false });
          return;
        }
        try {
          const user = await iamApi.getCurrentUser();
          localStorage.setItem('user_id', user.user_id);
          set({ user, isAuthenticated: true });
        } catch {
          await get().logout();
        }
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        tokens: state.tokens,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
