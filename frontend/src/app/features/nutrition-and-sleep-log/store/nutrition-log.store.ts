import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { NutritionApiService } from '../nutrition-api.service';
import {
  type GetNutritionHistory,
  type DeleteNutritionEntry,
  type NutritionStore,
  type SaveNutritionEntry,
} from './nutrition-log.model';
import { inject } from '@angular/core';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, finalize, map, of, pipe, switchMap, tap } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

const initialState: NutritionStore = {
  nutritionHistory: [],
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
          return api.getNutritionForDate(date).pipe(
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
    return {
      loadNutritionEntry,
      loadNutritionHistory: rxMethod<GetNutritionHistory>(
        pipe(
          switchMap(({ from, to }) => {
            patchState(store, {
              nutritionHistoryLoading: true,
            });
            return api.getNutritionHistory(from, to).pipe(
              tap((nutritionHistory) => {
                patchState(store, {
                  nutritionHistory: nutritionHistory,
                  nutritionHistoryStale: false,
                });
              }),
              catchError((error) => {
                console.error(error);
                return EMPTY;
              }),
              finalize(() => {
                patchState(store, {
                  nutritionHistoryLoading: false,
                });
              }),
            );
          }),
        ),
      ),
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
