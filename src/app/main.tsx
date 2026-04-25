import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { RouterProvider } from 'react-router-dom';

import { env } from '@/shared/config';

import { AppProviders } from './providers';
import { router } from './router';

import './index.css';

const root = document.getElementById('root');
if (!root) {
  throw new Error('Элемент #root не найден. Проверьте index.html.');
}

// Удалить статичный прелоадер после монтирования React
const removePreloader = () => {
  const preloader = document.getElementById('app-preloader');
  if (preloader) {
    preloader.classList.add('hidden');
    setTimeout(() => preloader.remove(), 400);
  }
};

const render = () => {
  createRoot(root).render(
    <StrictMode>
      <AppProviders>
        <RouterProvider router={router} />
      </AppProviders>
    </StrictMode>,
  );
  removePreloader();
};

const bootstrap = async () => {
  if (env.isDev) {
    const { worker } = await import('@/mocks/browser');
    await worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: { url: '/mockServiceWorker.js' },
    });
  }
  render();
};

void bootstrap();
