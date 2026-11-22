import { HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { patchState, signalStore, withFeature, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import {
  catchError,
  EMPTY,
  filter,
  finalize,
  map,
  merge,
  pipe,
  Subject,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs';
import { WorkoutApiService } from '../workout-api.service';
import {
  type GetWorkoutHistory,
  type DeleteWorkout,
  type SaveWorkout,
  type WorkoutStore,
  type MergeExerciseAction,
  type RenameExerciseAction,
} from './workout-log.model';
import { type WorkoutEntry } from '../workout.model';
import { type WorkoutEntryResponse } from '../../../api/generated/api-types';
import { withAuthLifecycle } from '../../../shared/store/withAuthLifecycle';

const initialState: WorkoutStore = {
  exerciseEntries: [],
  workoutEntries: [],
  workoutHistory: [],
  workoutHistoryLoading: false,
  workoutSaveInProgress: false,
  workoutsLoading: false,
  workoutHistoryStale: false,
  workoutDates: [],
  loadedDate: null,
  exerciseUpdateSucceeded: false,
};

export const WorkoutLogStore = signalStore(
  { providedIn: 'root' },
  withState<WorkoutStore>(initialState),
  withMethods((store, api = inject(WorkoutApiService)) => {
    const reset$ = new Subject<void>();

    const loadExercises$ = () =>
      api.getExercises().pipe(
        tap((exerciseEntries) => {
          patchState(store, { exerciseEntries });
        }),
        takeUntil(reset$),
      );

    const toWorkoutEntries = (entries: WorkoutEntryResponse[]): WorkoutEntry[] =>
      entries.map((entry) => ({ ...entry, newExerciseName: null }));

    const loadWorkoutDates$ = () =>
      api.getAllWorkoutDates().pipe(
        tap((response) => {
          patchState(store, { workoutDates: response.dates });
        }),
        catchError((error) => {
          console.error(error);
          return EMPTY;
        }),
        takeUntil(reset$),
      );

    const canEdit = ({ date }: { date: string }) =>
      store.loadedDate() === date && !store.workoutsLoading() && !store.workoutSaveInProgress();

    const loadWorkout = rxMethod<string>(
      pipe(
        tap(() => patchState(store, { workoutsLoading: true, loadedDate: null })),
        switchMap((date) =>
          api.getWorkout(date).pipe(
            tap((workout) => patchState(store, { loadedDate: workout.date })),
            map((workout) => toWorkoutEntries(workout.entries)),
            tap((workoutEntries) => {
              patchState(store, { workoutEntries, workoutsLoading: false });
            }),
            catchError((error) => {
              patchState(store, { workoutsLoading: false });

              if (error instanceof HttpErrorResponse && error.status === 404) {
                patchState(store, { workoutEntries: [], loadedDate: date });
                return EMPTY;
              }

              console.error(error);
              return EMPTY;
            }),
            takeUntil(reset$),
          ),
        ),
      ),
    );
    return {
      loadWorkout,
      clearStore: () => {
        reset$.next();
        patchState(store, initialState);
      },
      loadWorkoutHistory: rxMethod<GetWorkoutHistory>(
        pipe(
          switchMap(({ from, to }) => {
            patchState(store, { workoutHistoryLoading: true });
            return api.getWorkoutHistory(from, to).pipe(
              tap((workoutHistory) => {
                patchState(store, { workoutHistory, workoutHistoryStale: false });
              }),
              catchError(() => EMPTY),
              takeUntil(reset$),
              finalize(() => {
                patchState(store, { workoutHistoryLoading: false });
              }),
            );
          }),
        ),
      ),
      getWorkoutDates: rxMethod<void>(pipe(switchMap(() => loadWorkoutDates$()))),
      loadExercises: rxMethod<void>(
        pipe(
          switchMap(() =>
            loadExercises$().pipe(
              catchError((error) => {
                console.error(error);
                return EMPTY;
              }),
              takeUntil(reset$),
            ),
          ),
        ),
      ),
      mergeExercises: rxMethod<MergeExerciseAction>(
        pipe(
          switchMap((action) => {
            patchState(store, {
              workoutSaveInProgress: true,
              exerciseUpdateSucceeded: false,
            });

            return api.mergeExercises(action).pipe(
              tap(() => {
                patchState(store, { workoutHistoryStale: true });
                const date = store.loadedDate();
                if (date !== null) {
                  loadWorkout(date);
                }
              }),
              switchMap(() => loadExercises$()),
              tap(() => patchState(store, { exerciseUpdateSucceeded: true })),
              catchError((error) => {
                console.error(error);
                return EMPTY;
              }),
              takeUntil(reset$),
              finalize(() => {
                patchState(store, {
                  workoutSaveInProgress: false,
                });
              }),
            );
          }),
        ),
      ),
      renameExercise: rxMethod<RenameExerciseAction>(
        pipe(
          switchMap((action) => {
            patchState(store, {
              workoutSaveInProgress: true,
              exerciseUpdateSucceeded: false,
            });

            return api.renameExercise(action).pipe(
              tap(() => {
                patchState(store, { workoutHistoryStale: true });
              }),
              switchMap(() => loadExercises$()),
              tap(() => patchState(store, { exerciseUpdateSucceeded: true })),
              catchError((error) => {
                console.error(error);
                return EMPTY;
              }),
              takeUntil(reset$),
              finalize(() => {
                patchState(store, {
                  workoutSaveInProgress: false,
                });
              }),
            );
          }),
        ),
      ),
      resetExerciseUpdateSucceeded: () => {
        patchState(store, { exerciseUpdateSucceeded: false });
      },
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
                  exerciseEntries: [],
                });
              }),
              catchError((error) => {
                console.error(error);
                return EMPTY;
              }),
              takeUntil(reset$),
              finalize(() => {
                patchState(store, { workoutSaveInProgress: false });
              }),
            ),
          ),
        ),
      ),
      deleteWorkout: rxMethod<DeleteWorkout>(
        pipe(
          filter<DeleteWorkout>(canEdit),
          tap(() => {
            patchState(store, { workoutSaveInProgress: true });
          }),
          switchMap(({ date }) =>
            api.deleteWorkout(date).pipe(
              tap(() => {
                patchState(store, { workoutHistoryStale: true });
                if (store.loadedDate() === date) {
                  patchState(store, { workoutEntries: [] });
                }
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
              takeUntil(reset$),
              finalize(() => {
                patchState(store, { workoutSaveInProgress: false });
              }),
            ),
          ),
        ),
      ),
      saveWorkout: rxMethod<SaveWorkout>(
        pipe(
          filter<SaveWorkout>(canEdit),
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
                  patchState(store, { workoutHistoryStale: true });
                  if (store.loadedDate() === date) {
                    patchState(store, { workoutEntries: toWorkoutEntries(workout.entries) });
                  }
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
                takeUntil(reset$),
                finalize(() => {
                  patchState(store, { workoutSaveInProgress: false });
                }),
              ),
          ),
        ),
      ),
    };
  }),
  withFeature(({ clearStore, getWorkoutDates }) => withAuthLifecycle(clearStore, getWorkoutDates)),
);
