import type { PublicUser } from '@/entities/user/model/user.types';
import type { BaseUtilResponse } from '@/shared/types';

export type CreateUserDto = Omit<PublicUser, 'avatarUrl'> & { password: string };

export type LoginUserDto = Omit<CreateUserDto, 'firstName' | 'lastName'>;

export interface AuthResponse {
  accessToken: string;
  expiresIn: number;
  user: PublicUser;
}

export type LogoutResponse = BaseUtilResponse;
