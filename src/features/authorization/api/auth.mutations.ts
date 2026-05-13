import { useMutation, useQueryClient } from '@tanstack/react-query';

import { articleKeys } from '@/entities/article/api/article.queries';
import { researchKeys } from '@/entities/research/api/research.queries';
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
  const queryClient = useQueryClient();
  const setToken = useAuthStore((state) => state.setToken);
  const setUser = useUserStore((state) => state.setUser);

  return useMutation({
    mutationFn: () => authApi.refresh(),
    onSuccess: ({ accessToken, user }) => {
      setToken(accessToken);
      setUser(user);
      queryClient.setQueryData(userKeys.me(), user);
    },
  });
};

export const useLogoutUser = () => {
  const queryClient = useQueryClient();
  const clearToken = useAuthStore((state) => state.clearToken);
  const clearUser = useUserStore((state) => state.clearUser);

  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: async () => {
      clearToken();
      clearUser();
      queryClient.removeQueries({ queryKey: userKeys.me() });
      queryClient.removeQueries({ queryKey: researchKeys.all() });
      queryClient.removeQueries({ queryKey: articleKeys.all() });
    },
  });
};
