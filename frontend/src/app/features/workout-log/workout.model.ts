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