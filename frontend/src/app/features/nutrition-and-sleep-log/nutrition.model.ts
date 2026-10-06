export interface NutritionEntry {
  id: number;
  date: string;
  calories: number | null;
  protein: number | null;
  sleepHours: number | null;
  steps: number | null;
  sleepQuality: number | null;
  energy: number | null;
  notes: string | null;
}

export type SaveNutritionRequest = Omit<NutritionEntry, 'id' | 'date'>;

export interface NutritionDatesResponse {
  dates: string[];
}
