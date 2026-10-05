import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { BodyApiService, type SaveMeasurementRequest } from '../body-api.service';
import { type DeleteMeasurement, type BodyStore } from './body-log.model';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, delayWhen, EMPTY, map, of, pipe, switchMap, tap, timer } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

export interface SaveMeasurement {
  date: string;
  request: SaveMeasurementRequest;
}

const initialState: BodyStore = {
  currentMeasurement: null,
  measurementHistory: [],
  measurementHistoryLoading: false,
  measurementHistoryStale: false,
  measurementsLoading: false,
  measurementSaveInProgress: false,
};

export const BodyLogStore = signalStore(
  withState<BodyStore>(initialState),
  withMethods((store, api = inject(BodyApiService)) => {
    const MIN_LOADING_TIME = 1000;
    const remainingLoadingTime = (startedAt: number) =>
      timer(Math.max(0, MIN_LOADING_TIME - (Date.now() - startedAt)));
    const loadMeasurement = rxMethod<string>(
      pipe(
        tap(() => patchState(store, { measurementsLoading: true })),
        switchMap((date) => {
          const startedAt = Date.now();
          return api.getMeasurement(date).pipe(
            map((measurement) => ({
              measurement,
              error: null,
            })),
            catchError((error) =>
              of({
                measurement: null,
                error,
              }),
            ),
            delayWhen(() => remainingLoadingTime(startedAt)),
            tap(({ measurement, error }) => {
              patchState(store, {
                currentMeasurement: measurement,
                measurementsLoading: false,
              });
              if (error && !(error instanceof HttpErrorResponse && error.status === 404)) {
                console.error(error);
              }
            }),
          );
        }),
      ),
    );
    const loadMeasurementHistory = (from?: string, to?: string): void => {
      patchState(store, {
        measurementHistoryLoading: true,
      });

      api.getMeasurementHistory(from, to).subscribe({
        next: (measurementHistory) => {
          patchState(store, {
            measurementHistory,
            measurementHistoryLoading: false,
            measurementHistoryStale: false,
          });
        },
        error: (error) => {
          patchState(store, {
            measurementHistoryLoading: false,
          });

          console.error(error);
        },
      });
    };
    return {
      loadMeasurement,
      loadMeasurementHistory,
      deleteMeasurement: rxMethod<DeleteMeasurement>(
        pipe(
          tap(() => {
            patchState(store, { measurementSaveInProgress: true });
          }),
          switchMap(({ date }) => {
            const startedAt = Date.now();
            return api.deleteMeasurement(date).pipe(
              map(() => ({
                success: true as const,
              })),
              catchError((error) =>
                of({
                  success: false as const,
                  error,
                }),
              ),
              delayWhen(() => remainingLoadingTime(startedAt)),
              tap((result) => {
                if (result.success) {
                  patchState(store, {
                    currentMeasurement: null,
                    measurementSaveInProgress: false,
                    measurementHistoryStale: true,
                  });
                } else {
                  patchState(store, {
                    measurementSaveInProgress: false,
                  });
                  console.error(result.error);
                }
              }),
            );
          }),
        ),
      ),
      saveMeasurement: rxMethod<SaveMeasurement>(
        pipe(
          tap(() => {
            patchState(store, { measurementSaveInProgress: true });
          }),
          switchMap(({ date, request }) => {
            const startedAt = Date.now();
            return api.saveMeasurement(date, request).pipe(
              map((measurement) => ({
                success: true as const,
                measurement,
              })),
              catchError((error) =>
                of({
                  success: false as const,
                  error,
                }),
              ),
              delayWhen(() => remainingLoadingTime(startedAt)),
              tap((result) => {
                if (result.success) {
                  patchState(store, {
                    currentMeasurement: result.measurement,
                    measurementSaveInProgress: false,
                    measurementHistoryStale: true,
                  });
                } else {
                  patchState(store, {
                    measurementSaveInProgress: false,
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
