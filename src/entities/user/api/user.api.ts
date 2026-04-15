import { api } from '@/shared/api';
import { endpoints } from '@/shared/api/endpoints';

import type { AvatarUploadDto, AvatarUploadResponse, WhoAmIResponse } from '../model/user.types';

export const userApi = {
  me: (): Promise<WhoAmIResponse> => api.get<WhoAmIResponse>(endpoints.user.ME).then((r) => r.data),

  uploadAvatar: (dto: AvatarUploadDto): Promise<AvatarUploadResponse> =>
    api.put<AvatarUploadResponse>(endpoints.user.UPLOAD_AVATAR, dto).then((r) => r.data),
};
