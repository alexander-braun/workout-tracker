import {
  type NutritionEntryResponse,
  type NutritionEntryRequest,
} from '../../../api/generated/api-types';

export interface NutritionStore {
  currentNutritionEntry: NutritionEntryResponse | null;
  nutritionHistory: NutritionEntryResponse[];
  nutritionHistoryLoading: boolean;
  nutritionHistoryStale: boolean;
  nutritionEntryLoading: boolean;
  nutritionEntrySaveInProgress: boolean;
  nutritionDates: string[];
}

export interface DeleteNutritionEntry {
  date: string;
}

export interface SaveNutritionEntry {
  date: string;
  request: NutritionEntryRequest;
}

export interface GetNutritionHistory {
  from?: string;
  to?: string;
}
