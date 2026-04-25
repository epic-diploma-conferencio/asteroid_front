import { create } from 'zustand';

interface RouteLoaderState {
  isRouteLoading: boolean;
  setRouteLoading: (value: boolean) => void;
}

export const useRouteLoaderStore = create<RouteLoaderState>((set) => ({
  isRouteLoading: false,
  setRouteLoading: (value) => set({ isRouteLoading: value }),
}));
