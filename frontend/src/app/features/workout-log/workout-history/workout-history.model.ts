import { type WeightUnit } from '../workout.model';

export interface WorkoutSession {
  date: Date;
  reps: number;
  sets: number;
  weight?: number;
  weightUnit?: WeightUnit;
}

export interface ExerciseHistory {
  exercise: string;
  sessions: WorkoutSession[];
  exerciseId: string;
}

export interface ProgressChange {
  sets: number;
  reps: number;
  weight: number | null;
  weightUnit?: WeightUnit;
}

export interface ProgressRow {
  exerciseId: string;
  exercise: string;
  sessions: WorkoutSession[];
  latestReps: number;
  latestWeightSuffix: string;
  latestSets: number;
  change: ProgressChange | null;
}