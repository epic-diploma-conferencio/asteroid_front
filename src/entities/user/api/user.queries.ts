import { useQuery } from '@tanstack/react-query';

import { useAuthStore } from '@/features/authorization/model/auth.store';

import { userApi } from './user.api';
import { useUserStore } from '../model/user.store';

export const userKeys = {
  me: () => ['user', 'me'] as const,
};

export const useMe = () => {
  const token = useAuthStore((state) => state.token);

  return useQuery({
    queryKey: userKeys.me(),
    enabled: Boolean(token),
    queryFn: async () => {
      const response = await userApi.me();
      useUserStore.getState().setUser(response);
      return response;
    },
    select: (data) => data,
  });
};
