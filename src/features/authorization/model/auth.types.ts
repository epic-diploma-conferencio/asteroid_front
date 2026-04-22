import type { PublicUser } from '@/entities/user/model/user.types';
import type { BaseUtilResponse } from '@/shared/types';

export interface CreateUserDto {
  login: string;
  password: string;
}

export type LoginUserDto = CreateUserDto;

export interface AuthResponse {
  accessToken: string;
  expiresIn: number;
  user: PublicUser;
}

export type LogoutResponse = BaseUtilResponse;
