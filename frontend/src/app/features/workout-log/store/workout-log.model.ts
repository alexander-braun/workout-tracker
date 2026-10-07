import { type ExerciseResponse, type WorkoutResponse } from '../../../api/generated/api-types';
import { type WorkoutEntry } from '../workout.model';

export interface WorkoutStore {
  exerciseEntries: ExerciseResponse[];
  workoutEntries: WorkoutEntry[];
  workoutHistory: WorkoutResponse[];
  workoutHistoryLoading: boolean;
  workoutSaveInProgress: boolean;
  workoutsLoading: boolean;
  workoutHistoryStale: boolean;
  workoutDates: string[];
}

export interface SaveWorkout {
  date: string;
  entries: WorkoutEntry[];
}

export interface DeleteWorkout {
  date: string;
}

export interface GetWorkoutHistory {
  from?: string;
  to?: string;
}
