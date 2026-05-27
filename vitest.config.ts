import react from '@vitejs/plugin-react-swc';
import { resolve } from 'node:path';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [react()],

  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },

  test: {
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    globals: true,
    css: true,

    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/tests/**',
        'src/**/*.d.ts',
        'src/**/__tests__/**',
        'src/app/main.tsx',
        'src/shared/api/mocks/**',
        'src/vite-env.d.ts',
      ],
    },
  },
});
