import { type WeightUnit } from "../workout.model";

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

export interface ProgressRow {
  exercise: string;
  sessions: WorkoutSession[];
  best: string;
  bestSub: string;
  latest: string;
  latestSub: string;
  change: number;
  unit: string;
}