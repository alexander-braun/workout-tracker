import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

interface AppStoreState {
  selectedDate: Date;
}

const initialState: AppStoreState = {
  selectedDate: new Date(),
};

export const AppStore = signalStore(
  withState(initialState),

  withMethods((store) => ({
    setSelectedDate(selectedDate: Date): void {
      patchState(store, { selectedDate });
    },
  })),
);
