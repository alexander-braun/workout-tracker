import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { BodyApiService } from '../body-api.service';
import {
  type DeleteMeasurement,
  type BodyStore,
  type SaveMeasurement,
  type GetMeasurementHistory,
} from './body-log.model';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import {
  catchError,
  delayWhen,
  EMPTY,
  filter,
  finalize,
  map,
  of,
  pipe,
  switchMap,
  tap,
  timer,
} from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

const initialState: BodyStore = {
  currentMeasurement: null,
  measurementHistory: [],
  measurementHistoryLoading: false,
  measurementHistoryStale: false,
  measurementsLoading: false,
  measurementSaveInProgress: false,
  measurementDates: [],
};

export const BodyLogStore = signalStore(
  { providedIn: 'root' },
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

    const loadMeasurementDates$ = () =>
      api.getAllMeasurementDates().pipe(
        tap((response) => {
          patchState(store, {
            measurementDates: response.dates,
          });
        }),
        catchError((error) => {
          console.error(error);
          return EMPTY;
        }),
      );
    return {
      clearStore: () => {
        patchState(store, initialState);
      },
      deleteAllMeasurements: rxMethod<void>(
        pipe(
          tap(() => {
            patchState(store, { measurementSaveInProgress: true });
          }),
          switchMap(() => {
            const startedAt = Date.now();
            return api.deleteAllMeasurements().pipe(
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
                    measurementHistory: [],
                    measurementDates: [],
                    measurementHistoryStale: false,
                    measurementSaveInProgress: false,
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
      getMeasurementDates: rxMethod<void>(pipe(switchMap(() => loadMeasurementDates$()))),
      loadMeasurementHistory: rxMethod<GetMeasurementHistory>(
        pipe(
          switchMap(({ from, to }) => {
            patchState(store, {
              measurementHistoryLoading: true,
            });
            return api.getMeasurementHistory(from, to).pipe(
              tap((measurementHistory) => {
                patchState(store, {
                  measurementHistory,
                  measurementHistoryStale: false,
                });
              }),
              catchError((error) => {
                console.error(error);
                return EMPTY;
              }),
              finalize(() => {
                patchState(store, { measurementHistoryLoading: false });
              }),
            );
          }),
        ),
      ),
      loadMeasurement,
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
              filter((result) => result.success),
              switchMap(() => loadMeasurementDates$()),
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
              filter((result) => result.success),
              switchMap(() => loadMeasurementDates$()),
            );
          }),
        ),
      ),
    };
  }),
);
