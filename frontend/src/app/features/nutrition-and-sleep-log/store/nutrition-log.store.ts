import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { NutritionApiService } from '../nutrition-api.service';
import {
  type DeleteNutritionEntry,
  type NutritionStore,
  type SaveNutritionEntry,
} from './nutrition-log.model';
import { inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, map, of, pipe, switchMap, tap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

const initialState: NutritionStore = {
  nutritionEntryHistory: [],
  nutritionEntryLoading: false,
  nutritionEntrySaveInProgress: false,
  nutritionHistoryLoading: false,
  nutritionHistoryStale: false,
  currentNutritionEntry: null,
};

export const NutritionLogStore = signalStore(
  withState<NutritionStore>(initialState),
  withMethods((store, api = inject(NutritionApiService)) => {
    const loadNutritionEntry = rxMethod<string>(
      pipe(
        tap(() => patchState(store, { nutritionEntryLoading: true })),
        switchMap((date) => {
          return api.getNutritionEntryForDate(date).pipe(
            map((nutritionEntry) => ({
              nutritionEntry,
              error: null,
            })),
            catchError((error) => of({ nutritionEntry: null, error })),
            tap(({ nutritionEntry, error }) => {
              patchState(store, {
                currentNutritionEntry: nutritionEntry,
                nutritionEntryLoading: false,
              });
              if (error && !(error instanceof HttpErrorResponse && error.status === 404)) {
                console.error(error);
              }
            }),
          );
        }),
      ),
    );

    const loadNutritionHistory = (from?: string, to?: string): void => {
      patchState(store, { nutritionHistoryLoading: true });

      api.getNutritionHistory(from, to).subscribe({
        next: (nutritionHistory) => {
          patchState(store, {
            nutritionEntryHistory: nutritionHistory,
            nutritionHistoryLoading: false,
            nutritionHistoryStale: false,
          });
        },
        error: (error) => {
          patchState(store, { nutritionHistoryLoading: false });
          console.error(error);
        },
      });
    };
    return {
      loadNutritionEntry,
      loadNutritionHistory,
      deleteNutritionEntry: rxMethod<DeleteNutritionEntry>(
        pipe(
          tap(() => {
            patchState(store, { nutritionEntrySaveInProgress: true });
          }),
          switchMap(({ date }) => {
            return api.deleteNutritionEntry(date).pipe(
              map(() => ({
                success: true as const,
              })),
              catchError((error) => of({ success: false as const, error })),
              tap((result) => {
                if (result.success) {
                  patchState(store, {
                    currentNutritionEntry: null,
                    nutritionEntrySaveInProgress: false,
                    nutritionHistoryStale: true,
                  });
                } else {
                  patchState(store, {
                    nutritionEntrySaveInProgress: false,
                  });
                  console.error(result.error);
                }
              }),
            );
          }),
        ),
      ),
      saveNutritionEntry: rxMethod<SaveNutritionEntry>(
        pipe(
          tap(() => {
            patchState(store, { nutritionEntrySaveInProgress: true });
          }),
          switchMap(({ date, request }) => {
            return api.saveNutritionEntry(date, request).pipe(
              map((nutritionEntry) => ({
                success: true as const,
                nutritionEntry,
              })),
              catchError((error) => of({ success: false as const, error })),
              tap((result) => {
                if (result.success) {
                  patchState(store, {
                    currentNutritionEntry: result.nutritionEntry,
                    nutritionEntrySaveInProgress: false,
                    nutritionHistoryStale: true,
                  });
                } else {
                  patchState(store, {
                    nutritionEntrySaveInProgress: false,
                  });
                  console.error(result.error);
                }
              }),
            );
          }),
        ),
      ),
    };
  }),
);
