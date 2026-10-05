export interface ExerciseEntry {
  id: number;
  name: string;
}

export type WeightUnit = 'BW' | 'kg' | 'lbs';

export interface WorkoutEntry {
  id?: number;
  exerciseId: number | null;
  newExerciseName: string | null;
  sets: number;
  reps: number;
  weight: number | null;
  unit: WeightUnit;
  notes: string | null;
  position: number;
}

export interface SaveWorkoutRequest {
  entries: Omit<WorkoutEntry, 'id'>[];
}

type WorkoutResponseEntry = Omit<WorkoutEntry, 'newExerciseName' | 'exerciseId'> & {
  exerciseId: number;
};

export interface WorkoutResponse {
  id: number;
  date: string;
  entries: WorkoutResponseEntry[];
}

export interface WorkoutDatesResponse {
  dates: string[];
}