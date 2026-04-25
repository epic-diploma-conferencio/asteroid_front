import type { BaseUserResponse } from '@/shared/types';

export interface PublicUser {
  login: string;
}

export interface AvatarUploadDto {
  file: FormData;
  //вроде так но это не точно
}
export type AvatarUploadResponse = BaseUserResponse;

export type WhoAmIResponse = BaseUserResponse;
