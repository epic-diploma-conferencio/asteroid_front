import type { PublicUser } from '@/entities/user/model/user.types';
import type { BaseUtilResponse } from '@/shared/types';

export interface CreateUserDto {
  login: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface LoginUserDto {
  login: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  expiresIn: number;
  user: PublicUser;
}

export type LogoutResponse = BaseUtilResponse;
