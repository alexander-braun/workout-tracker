import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import {
  type MeasurementDatesResponse,
  type MeasurementEntryRequest,
  type MeasurementEntryResponse,
} from '../../api/generated/api-types';

@Injectable({
  providedIn: 'root',
})
export class BodyApiService {
  private readonly http = inject(HttpClient);

  getMeasurement(date: string): Observable<MeasurementEntryResponse> {
    return this.http.get<MeasurementEntryResponse>(`/api/measurements/${date}`);
  }

  getMeasurementHistory(from?: string, to?: string): Observable<MeasurementEntryResponse[]> {
    const params: Record<string, string> = {};

    if (from) {
      params['from'] = from;
    }

    if (to) {
      params['to'] = to;
    }

    return this.http.get<MeasurementEntryResponse[]>('/api/measurements', {
      params,
    });
  }

  saveMeasurement(
    date: string,
    request: MeasurementEntryRequest,
  ): Observable<MeasurementEntryResponse> {
    return this.http.put<MeasurementEntryResponse>(`/api/measurements/${date}`, request);
  }

  deleteMeasurement(date: string): Observable<void> {
    return this.http.delete<void>(`/api/measurements/${date}`);
  }

  getAllMeasurementDates(): Observable<MeasurementDatesResponse> {
    return this.http.get<MeasurementDatesResponse>('/api/measurements/dates');
  }

  deleteAllMeasurements(): Observable<void> {
    return this.http.delete<void>('/api/measurements');
  }
}
