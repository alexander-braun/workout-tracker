import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import {
  type NutritionEntryResponse,
  type NutritionDatesResponse,
  type NutritionEntryRequest,
} from '../../api/generated/api-types';

@Injectable({
  providedIn: 'root',
})
export class NutritionApiService {
  private readonly http = inject(HttpClient);

  getNutritionForDate(date: string): Observable<NutritionEntryResponse> {
    return this.http.get<NutritionEntryResponse>(`/api/nutrition/${date}`);
  }

  getNutritionHistory(from?: string, to?: string): Observable<NutritionEntryResponse[]> {
    const params: Record<string, string> = {};

    if (from) {
      params['from'] = from;
    }

    if (to) {
      params['to'] = to;
    }

    return this.http.get<NutritionEntryResponse[]>('/api/nutrition', {
      params,
    });
  }

  getAllNutritionDates(): Observable<NutritionDatesResponse> {
    return this.http.get<NutritionDatesResponse>('/api/nutrition/dates');
  }

  saveNutritionEntry(
    date: string,
    request: NutritionEntryRequest,
  ): Observable<NutritionEntryResponse> {
    return this.http.put<NutritionEntryResponse>(`/api/nutrition/${date}`, request);
  }

  deleteNutritionEntry(date: string): Observable<void> {
    return this.http.delete<void>(`/api/nutrition/${date}`);
  }

  deleteAllNutritionEntries(): Observable<void> {
    return this.http.delete<void>('/api/nutrition');
  }
}
