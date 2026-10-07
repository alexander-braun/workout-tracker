import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import {
  type SaveWorkoutRequest,
  type ExerciseResponse,
  type WorkoutResponse,
  type WorkoutDatesResponse,
} from '../../api/generated/api-types';

@Injectable({
  providedIn: 'root',
})
export class WorkoutApiService {
  private readonly http = inject(HttpClient);

  getExercises(): Observable<ExerciseResponse[]> {
    return this.http.get<ExerciseResponse[]>('/api/exercises');
  }

  getWorkout(date: string): Observable<WorkoutResponse> {
    return this.http.get<WorkoutResponse>(`/api/workouts/${date}`);
  }

  getWorkoutHistory(from?: string, to?: string): Observable<WorkoutResponse[]> {
    const params: Record<string, string> = {};

    if (from) {
      params['from'] = from;
    }

    if (to) {
      params['to'] = to;
    }

    return this.http.get<WorkoutResponse[]>('/api/workouts', {
      params,
    });
  }

  saveWorkout(date: string, request: SaveWorkoutRequest): Observable<WorkoutResponse> {
    return this.http.put<WorkoutResponse>(`/api/workouts/${date}`, request);
  }

  deleteWorkout(date: string): Observable<void> {
    return this.http.delete<void>(`/api/workouts/${date}`);
  }

  getAllWorkoutDates(): Observable<WorkoutDatesResponse> {
    return this.http.get<WorkoutDatesResponse>(`/api/workouts/dates`);
  }

  deleteAllWorkouts(): Observable<void> {
    return this.http.delete<void>('/api/workouts');
  }
}
