import { useShallow } from 'zustand/shallow';

import { createStore } from '@/shared/lib/zustand';

interface CounterState {
  count: number;
  step: number;
}

interface CounterActions {
  increment: () => void;
  decrement: () => void;
  reset: () => void;
  setStep: (step: number) => void;
}

type CounterStore = CounterState & CounterActions;

export const useCounterStore = createStore<CounterStore>('Counter', (set) => ({
  count: 0,
  step: 1,
  increment: () =>
    set((draft) => {
      draft.count += draft.step;
    }),
  decrement: () =>
    set((draft) => {
      draft.count -= draft.step;
    }),
  reset: () =>
    set((draft) => {
      draft.count = 0;
    }),
  setStep: (step) =>
    set((draft) => {
      draft.step = Math.max(1, step);
    }),
}));

export const useCount = () => useCounterStore((s) => s.count);

export const useCounterStep = () => useCounterStore((s) => s.step);

export const useCounterActions = () =>
  useCounterStore(
    useShallow((s) => ({
      increment: s.increment,
      decrement: s.decrement,
      reset: s.reset,
      setStep: s.setStep,
    })),
  );
