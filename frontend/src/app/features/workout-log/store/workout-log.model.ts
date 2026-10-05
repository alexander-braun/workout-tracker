
import { type WorkoutResponse, type ExerciseEntry, type WorkoutEntry } from '../workout.model';

export interface WorkoutStore {
  exerciseEntries: ExerciseEntry[];
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
