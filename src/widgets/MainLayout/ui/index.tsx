import { AnimatePresence, motion } from 'framer-motion';
import { useLayoutEffect, useRef, useState } from 'react';
import { Outlet, useLocation, useMatch } from 'react-router-dom';

import { useMe } from '@/entities/user';
import { Loader, useRouteLoaderStore } from '@/shared/ui/Loader';
import { Header } from '@/widgets/Header';

import './main-layout.scss';

export const MainLayout = () => {
  useMe();
  const { pathname, search } = useLocation();
  const setRouteLoadingState = useRouteLoaderStore((state) => state.setRouteLoading);
  const consumeSkippedRouteLoader = useRouteLoaderStore((state) => state.consumeSkippedRouteLoader);
  const isHomePage = useMatch('/');
  const noPadding = isHomePage;
  const [isRouteLoading, setRouteLoading] = useState(false);
  const isFirstRender = useRef(true);

  useLayoutEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      setRouteLoadingState(false);
      return;
    }

    if (consumeSkippedRouteLoader()) {
      setRouteLoading(false);
      setRouteLoadingState(false);
      return;
    }

    setRouteLoading(true);
    setRouteLoadingState(true);
    const timeoutId = window.setTimeout(() => {
      setRouteLoading(false);
      setRouteLoadingState(false);
    }, 500);

    return () => {
      window.clearTimeout(timeoutId);
      setRouteLoadingState(false);
    };
  }, [consumeSkippedRouteLoader, pathname, search, setRouteLoadingState]);

  return (
    <div className="main-layout">
      <Header />
      <main className={`main-layout__main${noPadding ? ' main-layout__main--no-padding' : ''}`}>
        <Outlet />
      </main>
      <AnimatePresence initial={false}>
        {isRouteLoading ? (
          <motion.div
            className="main-layout__route-loader"
            initial={false}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
          >
            <Loader size="lg" />
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};
