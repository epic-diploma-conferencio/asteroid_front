import { api } from '@/shared/api';
import { endpoints } from '@/shared/api/endpoints';

import type {
  AuthResponse,
  CreateUserDto,
  LoginUserDto,
  LogoutResponse,
} from '../model/auth.types';

export const authApi = {
  register: (dto: CreateUserDto): Promise<AuthResponse> =>
    api
      .post<AuthResponse>(endpoints.auth.REGISTER, {
        login: dto.login,
        password: dto.password,
        firstName: dto.firstName ?? dto.login,
        lastName: dto.lastName ?? dto.login,
      })
      .then((r) => r.data),

  login: (dto: LoginUserDto): Promise<AuthResponse> =>
    api
      .post<AuthResponse>(endpoints.auth.LOGIN, {
        login: dto.login,
        password: dto.password,
      })
      .then((r) => r.data),

  refresh: (): Promise<AuthResponse> =>
    api.post<AuthResponse>(endpoints.auth.REFRESH).then((r) => r.data),

  logout: (): Promise<LogoutResponse> =>
    api.post<LogoutResponse>(endpoints.auth.LOGOUT).then((r) => r.data),
};
