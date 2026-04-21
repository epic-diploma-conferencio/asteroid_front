import { useEffect } from 'react';

import { createPersistedStore } from '@/shared/lib/zustand';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
}

const useThemeStore = createPersistedStore<ThemeState>(
  'Theme',
  (set) => ({
    mode: 'system',
    setMode: (mode) =>
      set((draft) => {
        draft.mode = mode;
      }),
  }),
  { name: 'theme-store' },
);

function getResolvedTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode !== 'system') {
    return mode;
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(mode: ThemeMode) {
  document.documentElement.setAttribute('data-theme', getResolvedTheme(mode));
}

export function useSyncThemeEffect() {
  const { mode } = useThemeStore();

  useEffect(() => {
    applyTheme(mode);
  }, [mode]);

  useEffect(() => {
    if (mode !== 'system') {
      return;
    }

    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e: MediaQueryListEvent) => {
      document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    };

    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [mode]);
}

/**
 * Управление темой приложения.
 *
 * - `mode` — выбранный режим: `'light'`, `'dark'`, или `'system'` (по умолчанию).
 * - `resolvedTheme` — фактическая тема (`'light'` | `'dark'`), с учётом системной.
 * - `setMode` — установить конкретный режим.
 * - `toggle` — переключить между `light` и `dark`.
 *
 * Синхронизацию `data-theme` выполняет `useSyncThemeEffect()` в `ThemeProvider`.
 *
 * @example
 * const { resolvedTheme, toggle } = useTheme();
 */
export function useTheme() {
  const { mode, setMode } = useThemeStore();

  return {
    mode,
    resolvedTheme: getResolvedTheme(mode),
    setMode,
    toggle: () => {
      setMode(getResolvedTheme(mode) === 'dark' ? 'light' : 'dark');
    },
  };
}
