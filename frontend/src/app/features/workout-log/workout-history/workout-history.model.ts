import { type WeightUnit } from '../workout.model';

export type Range = '1M' | '3M' | '6M' | 'All';

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
}

export interface ProgressChange {
  sets: number;
  reps: number;
  weight: number | null;
  weightUnit?: WeightUnit;
}

export interface ProgressRow {
  exercise: string;
  sessions: WorkoutSession[];
  previous: string;
  previousSub: string;
  latest: string;
  latestSub: string;
  change: ProgressChange | null;
}
