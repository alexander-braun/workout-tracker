export interface ExerciseEntry {
  id: string;
  name: string;
}

export type WeightUnit = 'BW' | 'kg' | 'lbs';

export interface WorkoutEntry {
  id?: string | undefined;
  exerciseId: string | null;
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
  exerciseId: string;
};

export interface WorkoutResponse {
  id: string | null;
  date: string;
  entries: WorkoutResponseEntry[];
}

export interface WorkoutDatesResponse {
  dates: string[];
}
