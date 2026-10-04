import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import { catchError, EMPTY, map, pipe, switchMap, tap } from 'rxjs';
import { type WorkoutEntry } from '../workout.model';
import { WorkoutApiService, type WorkoutResponse } from '../workout-api.service';
import { type SaveWorkout, type WorkoutStore } from './workout-log.model';

const initialState: WorkoutStore = {
  exerciseEntries: [],
  workoutEntries: [],
  workoutHistory: [],
  workoutHistoryLoading: false,
  workoutSaveInProgress: false,
  workoutsLoading: false,
  workoutHistoryStale: false,
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
        workoutHistoryLoading: true
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
    return {
      loadWorkoutHistory: loadWorkoutHistory,
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

      loadWorkout: rxMethod<string>(
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
                  return loadExercises$().pipe(map(() => toWorkoutEntries(workout.entries)));
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
