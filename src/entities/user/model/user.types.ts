import type { BaseUserResponse } from '@/shared/types';

export interface PublicUser {
  login: string;
  firstName: string;
  lastName: string;
  avatarUrl: string;
}

export interface AvatarUploadDto {
  file: FormData;
}
export type AvatarUploadResponse = BaseUserResponse;

export type WhoAmIResponse = BaseUserResponse;
