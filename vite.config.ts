import react from '@vitejs/plugin-react-swc';
import { resolve } from 'node:path';
import { defineConfig, loadEnv, type Plugin } from 'vite';

export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const isProd = mode === 'production';

  const extraPlugins: Plugin[] = [];
  if (env.ANALYZE) {
    const { visualizer } = await import('rollup-plugin-visualizer');
    extraPlugins.push(
      visualizer({ open: true, gzipSize: true, brotliSize: true, filename: 'dist/stats.html' }),
    );
  }

  return {
    plugins: [react(), ...extraPlugins],

    resolve: {
      alias: {
        '@': resolve(__dirname, './src'),
      },
    },

    server: {
      host: true,
      port: Number(env.VITE_DEV_PORT) || 5173,
      strictPort: false,
      open: false,
      proxy: {
        '/api': {
          target: env.VITE_DEV_PROXY_TARGET || 'http://localhost:3000',
          changeOrigin: true,
          secure: false,
        },
      },
    },

    build: {
      target: 'es2022',
      outDir: 'dist',
      sourcemap: !isProd,
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom'],
            'router-vendor': ['react-router-dom'],
            'query-vendor': ['@tanstack/react-query', '@tanstack/react-query-devtools'],
            'zustand-vendor': ['zustand'],
            'charts-vendor': ['recharts'],
          },
        },
      },
    },

    preview: {
      port: 4173,
    },
  };
});
