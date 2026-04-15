import { create } from 'zustand';

import type { PublicUser } from '@/entities/user/model/user.types';

interface UserStore {
  user: PublicUser | null;
  setUser: (user: PublicUser) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
