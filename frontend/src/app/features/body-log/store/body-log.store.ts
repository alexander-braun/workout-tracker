import { inject } from '@angular/core';
import { patchState, signalStore, withFeature, withMethods, withState } from '@ngrx/signals';
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
  exhaustMap,
  filter,
  finalize,
  map,
  of,
  pipe,
  Subject,
  switchMap,
  takeUntil,
  tap,
  timer,
} from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { withAuthLifecycle } from '../../../shared/store/withAuthLifecycle';
import { type MeasurementEntryResponse } from '../../../api/generated/api-types';

const initialState: BodyStore = {
  currentMeasurement: null,
  measurementHistory: [],
  measurementHistoryLoading: false,
  measurementHistoryStale: false,
  measurementsLoading: false,
  measurementSaveInProgress: false,
  measurementDates: [],
  loadedDate: null,
};

export const BodyLogStore = signalStore(
  { providedIn: 'root' },
  withState<BodyStore>(initialState),
  withMethods((store, api = inject(BodyApiService)) => {
    const reset$ = new Subject<void>();
    const MIN_LOADING_TIME = 1000;

    // little wait so body svg animation has some time
    const remainingLoadingTime = (startedAt: number) =>
      timer(Math.max(0, MIN_LOADING_TIME - (Date.now() - startedAt)));
    
    const canEdit = ({ date }: { date: string }) =>
      store.loadedDate() === date &&
      !store.measurementsLoading() &&
      !store.measurementSaveInProgress();
    
      const normalizeMeasurement = (measurement: MeasurementEntryResponse) =>
      measurement.id === null ? null : measurement;
    
    const loadMeasurementDates$ = () =>
      api.getAllMeasurementDates().pipe(
        tap((response) => {
          patchState(store, { measurementDates: response.dates });
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
      deleteAllMeasurements: rxMethod<void>(
        pipe(
          filter(() => !store.measurementSaveInProgress() && !store.measurementsLoading()),
          exhaustMap(() => {
            patchState(store, { measurementSaveInProgress: true });

            const startedAt = Date.now();

            return api.deleteAllMeasurements().pipe(
              delayWhen(() => remainingLoadingTime(startedAt)),
              tap(() => {
                patchState(store, {
                  currentMeasurement: null,
                  measurementHistory: [],
                  measurementDates: [],
                  measurementHistoryStale: false,
                  loadedDate: null,
                });
              }),
              catchError((error) => {
                console.error(error);
                return EMPTY;
              }),
              takeUntil(reset$),
              finalize(() => {
                patchState(store, { measurementSaveInProgress: false });
              }),
            );
          }),
        ),
      ),

      getMeasurementDates: rxMethod<void>(pipe(switchMap(() => loadMeasurementDates$()))),

      loadMeasurementHistory: rxMethod<GetMeasurementHistory>(
        pipe(
          switchMap(({ from, to }) => {
            patchState(store, { measurementHistoryLoading: true });
            return api.getMeasurementHistory(from, to).pipe(
              tap((measurementHistory) => {
                patchState(store, { measurementHistory, measurementHistoryStale: false });
              }),
              catchError((error) => {
                console.error(error);
                return EMPTY;
              }),
              finalize(() => {
                patchState(store, { measurementHistoryLoading: false });
              }),
              takeUntil(reset$),
            );
          }),
        ),
      ),

      loadMeasurement: rxMethod<string>(
        pipe(
          tap(() => patchState(store, { measurementsLoading: true, loadedDate: null })),
          switchMap((date) => {
            const startedAt = Date.now();
            return api.getMeasurement(date).pipe(
              map((measurement) => ({
                measurement: normalizeMeasurement(measurement),
                error: null,
              })),
              catchError((error) => of({ measurement: null, error })),
              delayWhen(() => remainingLoadingTime(startedAt)),
              tap(({ measurement, error }) => {
                const dateLoaded =
                  !error || (error instanceof HttpErrorResponse && error.status === 404);

                patchState(store, {
                  currentMeasurement: measurement,
                  measurementsLoading: false,
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
      ),

      deleteMeasurement: rxMethod<DeleteMeasurement>(
        pipe(
          filter<DeleteMeasurement>(canEdit),
          tap(() => {
            patchState(store, { measurementSaveInProgress: true });
          }),
          switchMap(({ date }) => {
            const startedAt = Date.now();
            return api.deleteMeasurement(date).pipe(
              map(() => ({ success: true as const })),
              catchError((error) => of({ success: false as const, error })),
              delayWhen(() => remainingLoadingTime(startedAt)),
              tap((result) => {
                if (result.success) {
                  patchState(store, { measurementHistoryStale: true });

                  if (store.loadedDate() === date) {
                    patchState(store, { currentMeasurement: null });
                  }
                } else {
                  console.error(result.error);
                }
              }),
              filter((result) => result.success),
              switchMap(() => loadMeasurementDates$()),
              takeUntil(reset$),
              finalize(() => {
                patchState(store, { measurementSaveInProgress: false });
              }),
            );
          }),
        ),
      ),

      saveMeasurement: rxMethod<SaveMeasurement>(
        pipe(
          filter<SaveMeasurement>(canEdit),
          tap(() => {
            patchState(store, { measurementSaveInProgress: true });
          }),
          switchMap(({ date, request }) => {
            const startedAt = Date.now();
            return api.saveMeasurement(date, request).pipe(
              map((measurement) => ({
                success: true as const,
                measurement: normalizeMeasurement(measurement),
              })),
              catchError((error) => of({ success: false as const, error })),
              delayWhen(() => remainingLoadingTime(startedAt)),
              tap((result) => {
                if (result.success) {
                  patchState(store, { measurementHistoryStale: true });

                  if (store.loadedDate() === date) {
                    patchState(store, { currentMeasurement: result.measurement });
                  }
                } else {
                  console.error(result.error);
                }
              }),
              filter((result) => result.success),
              switchMap(() => loadMeasurementDates$()),
              takeUntil(reset$),
              finalize(() => {
                patchState(store, { measurementSaveInProgress: false });
              }),
            );
          }),
        ),
      ),
    };
  }),
  withFeature(({ clearStore, getMeasurementDates }) =>
    withAuthLifecycle(clearStore, getMeasurementDates),
  ),
);
