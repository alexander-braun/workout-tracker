import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { BodyApiService, type SaveMeasurementRequest } from '../body-api.service';
import { type DeleteMeasurement, type BodyStore } from './body-log.model';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, pipe, switchMap, tap } from 'rxjs';
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
    const loadMeasurement = rxMethod<string>(
      pipe(
        tap(() => patchState(store, { measurementsLoading: true })),
        switchMap((date) =>
          api.getMeasurement(date).pipe(
            tap((currentMeasurement) => {
              patchState(store, { currentMeasurement, measurementsLoading: false });
            }),
            catchError((error) => {
              patchState(store, { measurementsLoading: false });
              if (error instanceof HttpErrorResponse && error.status === 404) {
                patchState(store, { currentMeasurement: null });
                return EMPTY;
              }

              console.error(error);
              return EMPTY;
            }),
          ),
        ),
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
          switchMap(({ date }) =>
            api.deleteMeasurement(date).pipe(
              tap(() => {
                patchState(store, {
                  currentMeasurement: null,
                  measurementSaveInProgress: false,
                  measurementHistoryStale: true
                });
              }),
              catchError((error) => {
                patchState(store, { measurementSaveInProgress: false });
                console.error(error);
                return EMPTY;
              }),
            ),
          ),
        ),
      ),
      saveMeasurement: rxMethod<SaveMeasurement>(
        pipe(
          tap(() => {
            patchState(store, { measurementSaveInProgress: true });
          }),
          switchMap(({ date, request }) =>
            api.saveMeasurement(date, request).pipe(
              tap((measurement) => {
                patchState(store, {
                  currentMeasurement: measurement,
                  measurementSaveInProgress: false,
                  measurementHistoryStale: true
                });
              }),
              catchError((error) => {
                patchState(store, { measurementSaveInProgress: false });
                console.error(error);
                return EMPTY;
              }),
            ),
          ),
        ),
      ),
    };
  }),
);
