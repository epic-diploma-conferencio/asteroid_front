import { api } from '@/shared/api';
import { endpoints } from '@/shared/api/endpoints';

import type { SearchParams, SearchResponse, SearchUserResponse } from '../model/users.types';

export const usersApi = {
  search: (queryParams: SearchParams): Promise<SearchResponse> =>
    api.get<SearchResponse>(endpoints.users.SEARCH, { params: queryParams }).then((r) => r.data),

  searchUser: (login: string): Promise<SearchUserResponse> =>
    api.get<SearchUserResponse>(`${endpoints.users.SEARCH_USER}${login}`).then((r) => r.data),
};
