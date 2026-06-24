import { apiClient } from './api.client';
import type { User, AuthTokens, LoginCredentials, RegisterData } from '../types/user.types';

export const iamApi = {
  register: async (data: RegisterData): Promise<{ user_id: string; family_id: string }> => {
    const response = await apiClient.getInstance('IAM').post('/auth/register', data);
    return response.data;
  },

  login: async (credentials: LoginCredentials): Promise<AuthTokens> => {
    const response = await apiClient.getInstance('IAM').post('/auth/login', {
      ...credentials,
      device_id: credentials.device_id || navigator.userAgent,
    });
    return response.data;
  },

  refreshToken: async (refreshToken: string, userId: string): Promise<AuthTokens> => {
    const response = await apiClient.getInstance('IAM').post('/auth/refresh', {
      refresh_token: refreshToken,
      user_id: userId,
      device_id: navigator.userAgent,
    });
    return response.data;
  },

  logout: async (options?: { refresh_token?: string; global_logout?: boolean }): Promise<void> => {
    await apiClient.getInstance('IAM').post('/auth/logout', options);
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await apiClient.getInstance('IAM').get('/auth/me');
    return response.data;
  },
};
