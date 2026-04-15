import { useMutation } from '@tanstack/react-query';

import { userApi } from './user.api';
import { useUserStore } from '../model/user.store';
import type { AvatarUploadDto } from '../model/user.types';

export const useUploadAvatar = () => {
  const setUser = useUserStore((state) => state.setUser);

  return useMutation({
    mutationFn: (data: AvatarUploadDto) => userApi.uploadAvatar(data),
    onSuccess: ({ ...user }) => {
      setUser(user);
    },
  });
};
