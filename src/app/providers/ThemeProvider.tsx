import type { ReactNode } from 'react';

import { useSyncThemeEffect } from '@/shared/utils/theme/use-theme';

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  useSyncThemeEffect();
  return <>{children}</>;
};
