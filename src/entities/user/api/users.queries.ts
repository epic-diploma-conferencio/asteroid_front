import { useQuery } from '@tanstack/react-query';

import { usersApi } from './users.api';
import type { SearchParams } from '../model/users.types';

export const usersKeys = {
  all: () => ['users'] as const,
  list: (params: SearchParams) => ['users', 'list', params] as const,
  detail: (login: string) => ['users', 'detail', login] as const,
};

export const useSearch = (params: SearchParams) =>
  useQuery({
    queryKey: usersKeys.list(params),
    queryFn: () => usersApi.search(params),
    enabled: Object.values(params).some(Boolean),
  });

export const useSearchUser = (login: string) =>
  useQuery({
    queryKey: usersKeys.detail(login),
    queryFn: () => usersApi.searchUser(login),
    enabled: Boolean(login),
  });
