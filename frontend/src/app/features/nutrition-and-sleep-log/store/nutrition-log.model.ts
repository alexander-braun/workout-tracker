import { type SaveNutritionRequest, type NutritionEntry } from '../nutrition.model';

export interface NutritionStore {
  currentNutritionEntry: NutritionEntry | null;
  nutritionHistory: NutritionEntry[];
  nutritionHistoryLoading: boolean;
  nutritionHistoryStale: boolean;
  nutritionEntryLoading: boolean;
  nutritionEntrySaveInProgress: boolean;
}

export interface DeleteNutritionEntry {
  date: string;
}

export interface SaveNutritionEntry {
  date: string;
  request: SaveNutritionRequest;
}

export interface GetNutritionHistory {
  from?: string;
  to?: string;
}