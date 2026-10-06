import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { WorkoutLogStore } from '../features/workout-log/store/workout-log.store';
import { NutritionLogStore } from '../features/nutrition-and-sleep-log/store/nutrition-log.store';
import { BodyLogStore } from '../features/body-log/store/body-log.store';

interface AppStoreState {
  selectedDate: Date;
}

const initialState: AppStoreState = {
  selectedDate: new Date(),
};

export const AppStore = signalStore(
  withState(initialState),

  withMethods(
    (
      store,
      workoutStore = inject(WorkoutLogStore),
      nutritionStore = inject(NutritionLogStore),
      bodyStore = inject(BodyLogStore),
    ) => ({
      setSelectedDate(selectedDate: Date): void {
        patchState(store, { selectedDate });
      },
      deleteAllData() {
        workoutStore.deleteAllWorkouts();
        nutritionStore.deleteAllNutritionEntries();
        bodyStore.deleteAllMeasurements();
      },
    }),
  ),
);
