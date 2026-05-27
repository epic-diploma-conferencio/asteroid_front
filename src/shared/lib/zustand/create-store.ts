import { create, type StateCreator } from 'zustand';
import { devtools, persist, type PersistOptions } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

import { env } from '@/shared/config';

type ImmerCreator<T> = StateCreator<T, [['zustand/immer', never]], []>;

export function createStore<T extends object>(storeName: string, creator: ImmerCreator<T>) {
  return create<T>()(
    devtools(immer(creator), {
      name: storeName,
      enabled: env.enableDevtools,
    }),
  );
}

export function createPersistedStore<T extends object>(
  storeName: string,
  creator: ImmerCreator<T>,
  persistOptions: PersistOptions<T>,
) {
  return create<T>()(
    devtools(persist(immer(creator), persistOptions), {
      name: storeName,
      enabled: env.enableDevtools,
    }),
  );
}
