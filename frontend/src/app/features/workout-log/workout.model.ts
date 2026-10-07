export type WeightUnit = 'BW' | 'kg' | 'lbs';

export interface WorkoutEntry {
  id?: string;
  exerciseId: string | null;
  newExerciseName: string | null;
  sets: number;
  reps: number;
  weight: number | null;
  unit: WeightUnit;
  notes: string | null;
  position: number;
}
