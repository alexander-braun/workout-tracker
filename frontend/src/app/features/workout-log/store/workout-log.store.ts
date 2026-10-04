import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, map, pipe, switchMap, tap } from 'rxjs';
import { type WorkoutEntry } from '../workout.model';
import { WorkoutApiService, type WorkoutResponse } from '../workout-api.service';
import { type DeleteWorkout, type SaveWorkout, type WorkoutStore } from './workout-log.model';

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
  withState<WorkoutStore>(initialState),
  withMethods((store, api = inject(WorkoutApiService)) => {
    const loadExercises$ = () =>
      api.getExercises().pipe(
        tap((exerciseEntries) => {
          patchState(store, { exerciseEntries });
        }),
      );
    const toWorkoutEntries = (entries: WorkoutResponse['entries']): WorkoutEntry[] =>
      entries.map((entry) => ({
        ...entry,
        newExerciseName: null,
      }));
    const loadWorkoutHistory = (from?: string, to?: string): void => {
      patchState(store, {
        workoutHistoryLoading: true,
      });

      api.getWorkoutHistory(from, to).subscribe({
        next: (workoutHistory) => {
          patchState(store, {
            workoutHistory,
            workoutHistoryLoading: false,
            workoutHistoryStale: false,
          });
        },
        error: () => {
          patchState(store, { workoutHistoryLoading: false });
        },
      });
    };
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
      );
    return {
      loadWorkoutHistory,
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
      deleteWorkout: rxMethod<DeleteWorkout>(
        pipe(
          tap(() => {
            patchState(store, { workoutSaveInProgress: true });
          }),
          switchMap(({ date }) =>
            api.deleteWorkout(date).pipe(
              switchMap(() => loadWorkoutDates$()),
              tap(() => {
                patchState(store, {
                  workoutEntries: [],
                  workoutSaveInProgress: false,
                  workoutHistoryStale: true,
                });
              }),
              catchError((error) => {
                patchState(store, { workoutSaveInProgress: false });
                console.error(error);
                return EMPTY;
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
                switchMap((workout) => {
                  patchState(store, { workoutHistoryStale: true });
                  return loadWorkoutDates$().pipe(
                    switchMap(() => loadExercises$()),
                    map(() => toWorkoutEntries(workout.entries)),
                  );
                }),
                tap((workoutEntries) => {
                  patchState(store, { workoutEntries, workoutSaveInProgress: false });
                }),
                catchError((error) => {
                  patchState(store, { workoutSaveInProgress: false });
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
