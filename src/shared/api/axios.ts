import axios from 'axios';

import { useUserStore } from '@/entities/user';
import { authApi } from '@/features/authorization';
import { useAuthStore } from '@/features/authorization/model/auth.store';
import { endpoints } from '@/shared/api/endpoints';
import { env } from '@/shared/config';

export const api = axios.create({
  baseURL: env.apiUrl,
  timeout: env.apiTimeout,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request-интерсептор ──────────────────────────────────────────────────────
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => Promise.reject(error),
);

// ─── Response-интерсептор ─────────────────────────────────────────────────────
api.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const isRefreshRequest = error.config?.url?.includes(endpoints.auth.REFRESH);

      if (status === 401 && !error.config?._retry && !isRefreshRequest) {
        error.config!._retry = true;
        try {
          const { accessToken, user } = await authApi.refresh();
          useAuthStore.getState().setToken(accessToken);
          useUserStore.getState().setUser(user);
          return api.request(error.config!);
        } catch {
          useAuthStore.getState().clearToken();
          useUserStore.getState().clearUser();
          return Promise.reject(error);
        }
      }

      if (status === 403) {
        console.warn('Forbidden');
      }

      if (status && status >= 500) {
        console.error('Server error', status);
      }
    }

    return Promise.reject(error);
  },
);
