import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type {
  MeasurementDatesResponse,
  MeasurementEntry,
  SaveMeasurementRequest,
} from './body.model';

@Injectable({
  providedIn: 'root',
})
export class BodyApiService {
  private readonly http = inject(HttpClient);

  getMeasurement(date: string): Observable<MeasurementEntry> {
    return this.http.get<MeasurementEntry>(`/api/measurements/${date}`);
  }

  getMeasurementHistory(from?: string, to?: string): Observable<MeasurementEntry[]> {
    const params: Record<string, string> = {};

    if (from) {
      params['from'] = from;
    }

    if (to) {
      params['to'] = to;
    }

    return this.http.get<MeasurementEntry[]>('/api/measurements', {
      params,
    });
  }

  saveMeasurement(date: string, request: SaveMeasurementRequest): Observable<MeasurementEntry> {
    return this.http.put<MeasurementEntry>(`/api/measurements/${date}`, request);
  }

  deleteMeasurement(date: string): Observable<void> {
    return this.http.delete<void>(`/api/measurements/${date}`);
  }

  getAllMeasurementDates(): Observable<MeasurementDatesResponse> {
    return this.http.get<MeasurementDatesResponse>('/api/measurements/dates');
  }
}
