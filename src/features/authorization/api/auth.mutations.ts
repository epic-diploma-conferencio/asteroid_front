import { useMutation, useQueryClient } from '@tanstack/react-query';

import { userKeys } from '@/entities/user';
import { useUserStore } from '@/entities/user/model/user.store';

import { authApi } from './auth.api';
import { useAuthStore } from '../model/auth.store';
import type { CreateUserDto, LoginUserDto } from '../model/auth.types';

export const useCreateUser = () => {
  const queryClient = useQueryClient();
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useUserStore((state) => state.setUser);

  return useMutation({
    mutationFn: (data: CreateUserDto) => authApi.register(data),
    onSuccess: async ({ accessToken, user }) => {
      queryClient.setQueryData(userKeys.me(), user);
      setToken(accessToken);
      setUser(user);
    },
  });
};

export const useLoginUser = () => {
  const queryClient = useQueryClient();
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useUserStore((state) => state.setUser);

  return useMutation({
    mutationFn: (data: LoginUserDto) => authApi.login(data),
    onSuccess: async ({ accessToken, user }) => {
      queryClient.setQueryData(userKeys.me(), user);
      setToken(accessToken);
      setUser(user);
    },
  });
};

export const useRefreshUser = () => {
  const setToken = useAuthStore((state) => state.setToken);

  return useMutation({
    mutationFn: () => authApi.refresh(),
    onSuccess: ({ accessToken }) => {
      setToken(accessToken);
    },
  });
};

export const useLogoutUser = () => {
  const clearToken = useAuthStore((state) => state.clearToken);
  const clearUser = useUserStore((state) => state.clearUser);

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: async () => {
      clearToken();
      clearUser();
    },
  });
};
