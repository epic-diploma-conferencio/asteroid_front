import type { ReactNode } from 'react';
import { Toaster } from 'sonner';

import { QueryProvider } from './QueryProvider';
import { ThemeProvider } from './ThemeProvider';

interface AppProvidersProps {
  children: ReactNode;
}

export const AppProviders = ({ children }: AppProvidersProps) => (
  <ThemeProvider>
    <QueryProvider>
      {children}
      <Toaster richColors position="bottom-right" />
    </QueryProvider>
  </ThemeProvider>
);
