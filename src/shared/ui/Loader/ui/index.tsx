import { clsx } from 'clsx';

import './loader.scss';

type LoaderSize = 'sm' | 'md' | 'lg';

interface LoaderProps {
  className?: string;
  size?: LoaderSize;
  block?: boolean;
  overlay?: boolean;
  fullscreen?: boolean;
}

export const Loader = ({
  className,
  size = 'md',
  block = false,
  overlay = false,
  fullscreen = false,
}: LoaderProps) => (
  <div
    className={clsx(
      'app-loader',
      `app-loader--${size}`,
      {
        'app-loader--block': block,
        'app-loader--overlay': overlay,
        'app-loader--fullscreen': fullscreen,
      },
      className,
    )}
    role="status"
    aria-live="polite"
    aria-label="Загрузка"
  >
    <span className="app-loader__spinner" aria-hidden="true" />
  </div>
);
