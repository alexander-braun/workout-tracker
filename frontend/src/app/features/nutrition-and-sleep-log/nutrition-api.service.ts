import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type { NutritionEntry, SaveNutritionRequest } from './nutrition.model';

@Injectable({
  providedIn: 'root',
})
export class NutritionApiService {
  private readonly http = inject(HttpClient);

  getNutritionEntryForDate(date: string): Observable<NutritionEntry> {
    return this.http.get<NutritionEntry>(`/api/nutrition/${date}`);
  }

  getNutritionHistory(from?: string, to?: string): Observable<NutritionEntry[]> {
    const params: Record<string, string> = {};

    if (from) {
      params['from'] = from;
    }

    if (to) {
      params['to'] = to;
    }

    return this.http.get<NutritionEntry[]>('/api/nutrition', {
      params,
    });
  }

  saveNutritionEntry(date: string, request: SaveNutritionRequest): Observable<NutritionEntry> {
    return this.http.put<NutritionEntry>(`/api/nutrition/${date}`, request);
  }

  deleteNutritionEntry(date: string): Observable<void> {
    return this.http.delete<void>(`/api/nutrition/${date}`);
  }
}
