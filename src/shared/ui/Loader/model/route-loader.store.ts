import { create } from 'zustand';

interface RouteLoaderState {
  isRouteLoading: boolean;
  skipNextRouteLoader: boolean;
  setRouteLoading: (value: boolean) => void;
  suppressNextRouteLoader: () => void;
  consumeSkippedRouteLoader: () => boolean;
}

export const useRouteLoaderStore = create<RouteLoaderState>((set, get) => ({
  isRouteLoading: false,
  skipNextRouteLoader: false,
  setRouteLoading: (value) => set({ isRouteLoading: value }),
  suppressNextRouteLoader: () => set({ skipNextRouteLoader: true }),
  consumeSkippedRouteLoader: () => {
    const skipNextRouteLoader = get().skipNextRouteLoader;
    if (skipNextRouteLoader) {
      set({ skipNextRouteLoader: false });
    }
    return skipNextRouteLoader;
  },
}));
