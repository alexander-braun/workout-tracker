import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, finalize, map, merge, pipe, switchMap, tap } from 'rxjs';
import { WorkoutApiService } from '../workout-api.service';
import {
  type GetWorkoutHistory,
  type DeleteWorkout,
  type SaveWorkout,
  type WorkoutStore,
} from './workout-log.model';
import { type WorkoutEntry } from '../workout.model';
import { type WorkoutEntryResponse } from '../../../api/generated/api-types';

const initialState: WorkoutStore = {
  exerciseEntries: [],
  workoutEntries: [],
  workoutHistory: [],
  workoutHistoryLoading: false,
  workoutSaveInProgress: false,
  workoutsLoading: false,
  workoutHistoryStale: false,
  workoutDates: [],
};

export const WorkoutLogStore = signalStore(
  { providedIn: 'root' },
  withState<WorkoutStore>(initialState),
  withMethods((store, api = inject(WorkoutApiService)) => {
    const loadExercises$ = () =>
      api.getExercises().pipe(
        tap((exerciseEntries) => {
          patchState(store, { exerciseEntries });
        }),
      );
    const toWorkoutEntries = (entries: WorkoutEntryResponse[]): WorkoutEntry[] =>
      entries.map((entry) => ({
        ...entry,
        newExerciseName: null,
      }));
    const loadWorkout = rxMethod<string>(
      pipe(
        tap(() => patchState(store, { workoutsLoading: true })),
        switchMap((date) =>
          api.getWorkout(date).pipe(
            map((workout) => toWorkoutEntries(workout.entries)),
            tap((workoutEntries) => {
              patchState(store, { workoutEntries, workoutsLoading: false });
            }),
            catchError((error) => {
              patchState(store, { workoutsLoading: false });
              if (error instanceof HttpErrorResponse && error.status === 404) {
                patchState(store, { workoutEntries: [] });
                return EMPTY;
              }

              console.error(error);
              return EMPTY;
            }),
          ),
        ),
      ),
    );
    const loadWorkoutDates$ = () =>
      api.getAllWorkoutDates().pipe(
        tap((response) => {
          patchState(store, {
            workoutDates: response.dates,
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
      loadWorkoutHistory: rxMethod<GetWorkoutHistory>(
        pipe(
          switchMap(({ from, to }) => {
            patchState(store, {
              workoutHistoryLoading: true,
            });
            return api.getWorkoutHistory(from, to).pipe(
              tap((workoutHistory) => {
                patchState(store, {
                  workoutHistory,
                  workoutHistoryStale: false,
                });
              }),
              catchError(() => EMPTY),
              finalize(() => {
                patchState(store, {
                  workoutHistoryLoading: false,
                });
              }),
            );
          }),
        ),
      ),
      loadWorkout,
      getWorkoutDates: rxMethod<void>(pipe(switchMap(() => loadWorkoutDates$()))),
      loadExercises: rxMethod<void>(
        pipe(
          switchMap(() =>
            loadExercises$().pipe(
              catchError((error) => {
                console.error(error);
                return EMPTY;
              }),
            ),
          ),
        ),
      ),
      deleteAllWorkouts: rxMethod<void>(
        pipe(
          tap(() => {
            patchState(store, { workoutSaveInProgress: true });
          }),
          switchMap(() =>
            api.deleteAllWorkouts().pipe(
              tap(() => {
                patchState(store, {
                  workoutEntries: [],
                  workoutHistory: [],
                  workoutHistoryStale: false,
                  workoutDates: [],
                });
              }),
              catchError((error) => {
                console.error(error);
                return EMPTY;
              }),
              finalize(() => {
                patchState(store, { workoutSaveInProgress: false });
              }),
            ),
          ),
        ),
      ),
      deleteWorkout: rxMethod<DeleteWorkout>(
        pipe(
          tap(() => {
            patchState(store, { workoutSaveInProgress: true });
          }),
          switchMap(({ date }) =>
            api.deleteWorkout(date).pipe(
              tap(() => {
                patchState(store, {
                  workoutEntries: [],
                  workoutHistoryStale: true,
                });
              }),
              switchMap(() => loadWorkoutDates$()),
              catchError((error) => {
                console.error(error);
                return EMPTY;
              }),
              finalize(() => {
                patchState(store, { workoutSaveInProgress: false });
              }),
            ),
          ),
        ),
      ),

      saveWorkout: rxMethod<SaveWorkout>(
        pipe(
          tap(() => {
            patchState(store, { workoutSaveInProgress: true });
          }),
          switchMap(({ date, entries }) =>
            api
              .saveWorkout(date, {
                entries: entries.map((entry, position) => ({
                  exerciseId: entry.exerciseId,
                  newExerciseName: entry.exerciseId === null ? entry.newExerciseName : null,
                  sets: entry.sets,
                  reps: entry.reps,
                  weight: entry.weight,
                  unit: entry.unit,
                  notes: entry.notes,
                  position,
                })),
              })
              .pipe(
                tap((workout) => {
                  patchState(store, {
                    workoutEntries: toWorkoutEntries(workout.entries),
                    workoutHistoryStale: true,
                  });
                }),
                switchMap(() =>
                  merge(
                    loadWorkoutDates$(),
                    loadExercises$().pipe(
                      catchError((error) => {
                        console.error(error);
                        return EMPTY;
                      }),
                    ),
                  ),
                ),
                catchError((error) => {
                  console.error(error);
                  return EMPTY;
                }),
                finalize(() => {
                  patchState(store, { workoutSaveInProgress: false });
                }),
              ),
          ),
        ),
      ),
    };
  }),
);
