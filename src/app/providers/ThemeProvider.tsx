import type { ReactNode } from 'react';

import { useSyncThemeEffect } from '@/shared/utils/theme/use-theme';

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Инициализирует тему при старте приложения:
 * применяет `data-theme` на `<html>` и следит за системными изменениями.
 *
 * Оборачивает корневой узел в `AppProviders`.
 */
export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  useSyncThemeEffect();
  return <>{children}</>;
};
