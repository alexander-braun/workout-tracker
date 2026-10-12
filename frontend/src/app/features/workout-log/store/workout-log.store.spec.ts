import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { WorkoutLogStore } from './workout-log.store';

describe('WorkoutLogStore', () => {
  let store: InstanceType<typeof WorkoutLogStore>;
  let http: HttpTestingController;
  const date = '2026-10-12';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    store = TestBed.inject(WorkoutLogStore);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('loads the workout for a date', () => {
    store.loadWorkout(date);
    expect(store.workoutsLoading()).toBe(true);
    expect(store.loadedDate()).toBeNull();
    const request = http.expectOne(`/api/workouts/${date}`);
    expect(request.request.method).toBe('GET');
    request.flush({
      id: null,
      date,
      entries: [],
    });
    expect(store.workoutsLoading()).toBe(false);
    expect(store.loadedDate()).toBe(date);
    expect(store.workoutEntries()).toEqual([]);
  });

  it('prevents saving while the workout is loading', () => {
    store.loadWorkout(date);
    const request = http.expectOne(`/api/workouts/${date}`);
    store.saveWorkout({ date, entries: [] });
    http.expectNone((req) => req.method === 'PUT');
    request.flush({
      id: null,
      date,
      entries: [],
    });
    expect(store.loadedDate()).toBe(date);
  });

  it('cancels pending requests when the store resets', () => {
    store.loadWorkout(date);
    const request = http.expectOne(`/api/workouts/${date}`);
    store.clearStore();
    expect(request.cancelled).toBe(true);
    expect(store.loadedDate()).toBeNull();
    expect(store.workoutsLoading()).toBe(false);
  });

  it('cancels the previous request when switching dates', () => {
    const firstDate = '2026-10-11';
    const secondDate = '2026-10-12';
    store.loadWorkout(firstDate);
    const firstRequest = http.expectOne(`/api/workouts/${firstDate}`);
    store.loadWorkout(secondDate);
    expect(firstRequest.cancelled).toBe(true);
    const secondRequest = http.expectOne(`/api/workouts/${secondDate}`);
    secondRequest.flush({
      id: null,
      date: secondDate,
      entries: [],
    });
    expect(store.loadedDate()).toBe(secondDate);
    expect(store.workoutsLoading()).toBe(false);
  });

  it('treats a 404 as an empty, successfully loaded workout', () => {
    store.loadWorkout(date);
    const request = http.expectOne(`/api/workouts/${date}`);
    request.flush({}, { status: 404, statusText: 'Not Found' });
    expect(store.workoutsLoading()).toBe(false);
    expect(store.loadedDate()).toBe(date);
    expect(store.workoutEntries()).toEqual([]);
  });

  it('saves a workout and refreshes related data', () => {
    const exerciseId = '11111111-1111-4111-8111-111111111111';
    store.loadWorkout(date);
    http.expectOne(`/api/workouts/${date}`).flush({
      id: null,
      date,
      entries: [],
    });
    store.saveWorkout({
      date,
      entries: [
        {
          exerciseId,
          newExerciseName: null,
          sets: 3,
          reps: 10,
          weight: 5,
          unit: 'kg',
          notes: null,
          position: 0,
        },
      ],
    });
    expect(store.workoutSaveInProgress()).toBe(true);
    const saveRequest = http.expectOne(`/api/workouts/${date}`);
    expect(saveRequest.request.method).toBe('PUT');
    expect(saveRequest.request.body.entries).toEqual([
      {
        exerciseId,
        newExerciseName: null,
        sets: 3,
        reps: 10,
        weight: 5,
        unit: 'kg',
        notes: null,
        position: 0,
      },
    ]);
    saveRequest.flush({
      id: '22222222-2222-4222-8222-222222222222',
      date,
      entries: [
        {
          id: '33333333-3333-4333-8333-333333333333',
          exerciseId,
          sets: 3,
          reps: 10,
          weight: 5,
          unit: 'kg',
          notes: null,
          position: 0,
        },
      ],
    });

    expect(store.workoutHistoryStale()).toBe(true);
    expect(store.workoutEntries()[0].reps).toBe(10);
    http.expectOne('/api/workouts/dates').flush({
      dates: [date],
    });
    http.expectOne('/api/exercises').flush([]);
    expect(store.workoutDates()).toEqual([date]);
    expect(store.workoutSaveInProgress()).toBe(false);
  });

  it('preserves workout data and resets loading state after a failed save', () => {
    store.loadWorkout(date);
    http.expectOne(`/api/workouts/${date}`).flush({
      id: null,
      date,
      entries: [],
    });
    store.saveWorkout({ date, entries: [] });
    expect(store.workoutSaveInProgress()).toBe(true);
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      http
        .expectOne(`/api/workouts/${date}`)
        .flush(
          { message: 'Internal Server Error' },
          { status: 500, statusText: 'Internal Server Error' },
        );

      expect(store.workoutSaveInProgress()).toBe(false);
      expect(store.loadedDate()).toBe(date);
      expect(store.workoutEntries()).toEqual([]);
      expect(store.workoutHistoryStale()).toBe(false);

      http.expectNone('/api/workouts/dates');
      http.expectNone('/api/exercises');

      expect(consoleError).toHaveBeenCalledOnce();
    } finally {
      consoleError.mockRestore();
    }
  });

  it('does not mark a workout as loaded when the request fails', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      store.loadWorkout(date);
      http
        .expectOne(`/api/workouts/${date}`)
        .flush(
          { message: 'Internal Server Error' },
          { status: 500, statusText: 'Internal Server Error' },
        );

      expect(store.workoutsLoading()).toBe(false);
      expect(store.loadedDate()).toBeNull();
      store.saveWorkout({ date, entries: [] });
      http.expectNone((req) => req.method === 'PUT');
      expect(consoleError).toHaveBeenCalledOnce();
    } finally {
      consoleError.mockRestore();
    }
  });

  it('deletes a workout and refreshes related data', () => {
    store.loadWorkout(date);
    http.expectOne(`/api/workouts/${date}`).flush({
      id: '22222222-2222-4222-8222-222222222222',
      date,
      entries: [
        {
          id: '33333333-3333-4333-8333-333333333333',
          exerciseId: '11111111-1111-4111-8111-111111111111',
          sets: 3,
          reps: 10,
          weight: 5,
          unit: 'kg',
          notes: null,
          position: 0,
        },
      ],
    });
    expect(store.workoutEntries()).toHaveLength(1);
    store.deleteWorkout({ date });
    expect(store.workoutSaveInProgress()).toBe(true);
    const deleteRequest = http.expectOne(`/api/workouts/${date}`);
    expect(deleteRequest.request.method).toBe('DELETE');
    deleteRequest.flush(null);
    expect(store.workoutEntries()).toEqual([]);
    expect(store.workoutHistoryStale()).toBe(true);
    http.expectOne('/api/workouts/dates').flush({
      dates: [],
    });
    http.expectOne('/api/exercises').flush([]);
    expect(store.workoutDates()).toEqual([]);
    expect(store.workoutSaveInProgress()).toBe(false);
  });
});
