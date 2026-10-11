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
import {
  catchError,
  EMPTY,
  filter,
  finalize,
  map,
  of,
  pipe,
  Subject,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

const initialState: NutritionStore = {
  nutritionHistory: [],
  nutritionEntryLoading: false,
  nutritionEntrySaveInProgress: false,
  nutritionHistoryLoading: false,
  nutritionHistoryStale: false,
  currentNutritionEntry: null,
  nutritionDates: [],
  loadedDate: null,
};

export const NutritionLogStore = signalStore(
  { providedIn: 'root' },
  withState<NutritionStore>(initialState),
  withMethods((store, api = inject(NutritionApiService)) => {
    const reset$ = new Subject<void>();
    const loadNutritionEntry = rxMethod<string>(
      pipe(
        tap(() => patchState(store, { nutritionEntryLoading: true, loadedDate: null })),
        switchMap((date) => {
          return api.getNutritionForDate(date).pipe(
            map((nutritionEntry) => ({
              nutritionEntry,
              error: null,
            })),
            catchError((error) => of({ nutritionEntry: null, error })),
            tap(({ nutritionEntry, error }) => {
              const dateLoaded =
                !error || (error instanceof HttpErrorResponse && error.status === 404);
              patchState(store, {
                currentNutritionEntry: nutritionEntry?.id === null ? null : nutritionEntry,
                nutritionEntryLoading: false,
                loadedDate: dateLoaded ? date : null,
              });
              if (error && !(error instanceof HttpErrorResponse && error.status === 404)) {
                console.error(error);
              }
            }),
            takeUntil(reset$),
          );
        }),
      ),
    );
    const loadNutritionDates$ = () =>
      api.getAllNutritionDates().pipe(
        tap((response) => {
          patchState(store, {
            nutritionDates: response.dates,
          });
        }),
        catchError((error) => {
          console.error(error);
          return EMPTY;
        }),
        takeUntil(reset$),
      );
    return {
      clearStore: () => {
        reset$.next();
        patchState(store, initialState);
      },
      loadNutritionEntry,
      getNutritionDates: rxMethod<void>(pipe(switchMap(() => loadNutritionDates$()))),
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
              takeUntil(reset$),
              finalize(() => {
                patchState(store, {
                  nutritionHistoryLoading: false,
                });
              }),
            );
          }),
        ),
      ),
      deleteAllNutritionEntries: rxMethod<void>(
        pipe(
          tap(() => {
            patchState(store, { nutritionEntrySaveInProgress: true });
          }),
          switchMap(() =>
            api.deleteAllNutritionEntries().pipe(
              map(() => ({
                success: true as const,
              })),
              catchError((error) => of({ success: false as const, error })),
              tap((result) => {
                if (result.success) {
                  patchState(store, {
                    currentNutritionEntry: null,
                    nutritionEntrySaveInProgress: false,
                    nutritionHistory: [],
                    nutritionHistoryStale: false,
                    nutritionDates: [],
                  });
                } else {
                  patchState(store, {
                    nutritionEntrySaveInProgress: false,
                  });
                  console.error(result.error);
                }
              }),
              takeUntil(reset$),
            ),
          ),
        ),
      ),
      deleteNutritionEntry: rxMethod<DeleteNutritionEntry>(
        pipe(
          filter(
            ({ date }) =>
              store.loadedDate() === date &&
              !store.nutritionEntryLoading() &&
              !store.nutritionEntrySaveInProgress(),
          ),
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
                    nutritionHistoryStale: true,
                  });

                  if (store.loadedDate() === date) {
                    patchState(store, { currentNutritionEntry: null });
                  }
                } else {
                  console.error(result.error);
                }
              }),
              filter((result) => result.success),
              switchMap(() => loadNutritionDates$()),
              takeUntil(reset$),
              finalize(() => {
                patchState(store, { nutritionEntrySaveInProgress: false });
              }),
            );
          }),
        ),
      ),
      saveNutritionEntry: rxMethod<SaveNutritionEntry>(
        pipe(
          filter(
            ({ date }) =>
              store.loadedDate() === date &&
              !store.nutritionEntryLoading() &&
              !store.nutritionEntrySaveInProgress(),
          ),
          tap(() => {
            patchState(store, { nutritionEntrySaveInProgress: true });
          }),
          switchMap(({ date, request }) => {
            return api.saveNutritionEntry(date, request).pipe(
              map((nutritionEntry) => ({
                success: true as const,
                nutritionEntry: nutritionEntry?.id === null ? null : nutritionEntry,
              })),
              catchError((error) => of({ success: false as const, error })),
              tap((result) => {
                if (result.success) {
                  patchState(store, {
                    nutritionHistoryStale: true,
                  });

                  if (store.loadedDate() === date) {
                    patchState(store, {
                      currentNutritionEntry: result.nutritionEntry,
                    });
                  }
                } else {
                  console.error(result.error);
                }
              }),
              filter((result) => result.success),
              switchMap(() => loadNutritionDates$()),
              takeUntil(reset$),
              finalize(() => {
                patchState(store, { nutritionEntrySaveInProgress: false });
              }),
            );
          }),
        ),
      ),
    };
  }),
);
