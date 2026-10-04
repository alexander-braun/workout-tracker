import { type WorkoutResponse } from "../workout-api.service";
import { type ExerciseEntry, type WorkoutEntry } from "../workout.model";

export interface WorkoutStore {
  exerciseEntries: ExerciseEntry[];
  workoutEntries: WorkoutEntry[];
  workoutHistory: WorkoutResponse[];
  workoutHistoryLoading: boolean;
  workoutSaveInProgress: boolean;
  workoutsLoading: boolean;
  workoutHistoryStale: boolean;
}

export interface SaveWorkout {
  date: string;
  entries: WorkoutEntry[];
}