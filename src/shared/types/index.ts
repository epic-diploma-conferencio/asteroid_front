import type { PublicUser } from '@/entities/user/model/user.types';

export interface ErrorResponse {
  timestamp: string;
  status: number;
  code: string;
  message: string;
  path: string;
}

export type BaseUserResponse = PublicUser;

export interface BaseUtilResponse {
  message: string;
}

export interface BasePaginatedRequestQueryParams {
  page?: number;
  size?: number;
}

export type RequiredKeys<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type PartialKeys<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, string[]>;
}

export type Nullable<T> = T | null;

export type AsyncFn<TArgs extends unknown[] = [], TReturn = void> = (
  ...args: TArgs
) => Promise<TReturn>;
