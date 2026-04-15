import type { BaseUserResponse } from '@/shared/types';

import type { PublicUser } from './user.types';

export interface SearchResponse {
  items: PublicUser[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface SearchParams {
  login?: string;
  firstName?: string;
  lastName?: string;
  matchMode?: 'PARTIAL' | 'EXACT';
  page?: number;
  size?: number;
  excludeMe?: boolean;
}

export type SearchUserResponse = BaseUserResponse;
