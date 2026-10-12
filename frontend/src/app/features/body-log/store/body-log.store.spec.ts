import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { BodyLogStore } from './body-log.store';

describe('BodyLogStore', () => {
  let store: InstanceType<typeof BodyLogStore>;
  let http: HttpTestingController;
  const date = '2026-10-12';

  beforeEach(() => {
    vi.useFakeTimers();

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    store = TestBed.inject(BodyLogStore);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    vi.useRealTimers();
  });

  it('loads measurements for a date', () => {
    store.loadMeasurement(date);
    expect(store.measurementsLoading()).toBe(true);
    expect(store.loadedDate()).toBeNull();
    const request = http.expectOne(`/api/measurements/${date}`);
    expect(request.request.method).toBe('GET');
    request.flush({
      id: null,
      date,
      weight: null,
      chest: null,
      waist: null,
      neck: null,
      bicepsLeft: null,
      bicepsRight: null,
      thighLeft: null,
      thighRight: null,
      calfLeft: null,
      calfRight: null,
    });

    // Store waits at least 1 second.
    expect(store.measurementsLoading()).toBe(true);
    vi.advanceTimersByTime(1000);
    expect(store.measurementsLoading()).toBe(false);
    expect(store.loadedDate()).toBe(date);
    expect(store.currentMeasurement()).toBeNull();
  });

  it('cancels the previous request when switching dates', () => {
    const firstDate = '2026-10-11';
    const secondDate = '2026-10-12';
    store.loadMeasurement(firstDate);
    const firstRequest = http.expectOne(`/api/measurements/${firstDate}`);
    store.loadMeasurement(secondDate);
    expect(firstRequest.cancelled).toBe(true);
    const secondRequest = http.expectOne(`/api/measurements/${secondDate}`);
    secondRequest.flush({
      id: null,
      date: secondDate,
    });
    vi.advanceTimersByTime(1000);
    expect(store.loadedDate()).toBe(secondDate);
    expect(store.measurementsLoading()).toBe(false);
    expect(store.currentMeasurement()).toBeNull();
  });

  it('does not mark measurements as loaded when the request fails', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      store.loadMeasurement(date);
      http
        .expectOne(`/api/measurements/${date}`)
        .flush(
          { message: 'Internal Server Error' },
          { status: 500, statusText: 'Internal Server Error' },
        );
      vi.advanceTimersByTime(1000);
      expect(store.measurementsLoading()).toBe(false);
      expect(store.loadedDate()).toBeNull();
      expect(store.currentMeasurement()).toBeNull();
      expect(consoleError).toHaveBeenCalledOnce();
    } finally {
      consoleError.mockRestore();
    }
  });

  it('saves measurements and refreshes related data', () => {
    const measurement = {
      weight: 81.5,
      chest: 100,
      waist: 82,
      neck: null,
      bicepsLeft: null,
      bicepsRight: null,
      thighLeft: null,
      thighRight: null,
      calfLeft: null,
      calfRight: null,
    };
    store.loadMeasurement(date);
    http.expectOne(`/api/measurements/${date}`).flush({
      id: null,
      date,
    });
    vi.advanceTimersByTime(1000);
    store.saveMeasurement({ date, request: measurement });
    expect(store.measurementSaveInProgress()).toBe(true);
    const saveRequest = http.expectOne(`/api/measurements/${date}`);
    expect(saveRequest.request.method).toBe('PUT');
    expect(saveRequest.request.body).toEqual(measurement);
    saveRequest.flush({
      id: '11111111-1111-4111-8111-111111111111',
      date,
      ...measurement,
    });
    // pending during minimum loading delay
    expect(store.measurementSaveInProgress()).toBe(true);
    vi.advanceTimersByTime(1000);
    expect(store.currentMeasurement()?.weight).toBe(81.5);
    expect(store.measurementHistoryStale()).toBe(true);
    http.expectOne('/api/measurements/dates').flush({
      dates: [date],
    });
    expect(store.measurementDates()).toEqual([date]);
    expect(store.measurementSaveInProgress()).toBe(false);
  });

  it('prevents saving while measurements are loading', () => {
    const measurement = {
      weight: 81.5,
      chest: null,
      waist: null,
      neck: null,
      bicepsLeft: null,
      bicepsRight: null,
      thighLeft: null,
      thighRight: null,
      calfLeft: null,
      calfRight: null,
    };
    store.loadMeasurement(date);
    const loadRequest = http.expectOne(`/api/measurements/${date}`);
    store.saveMeasurement({ date, request: measurement });
    http.expectNone((req) => req.method === 'PUT');
    loadRequest.flush({ id: null, date });
    // HTTP response has arrived, but loading is not finished.
    store.saveMeasurement({ date, request: measurement });
    http.expectNone((req) => req.method === 'PUT');
    vi.advanceTimersByTime(1000);
    expect(store.measurementsLoading()).toBe(false);
    expect(store.loadedDate()).toBe(date);
  });

  it('preserves measurements and resets loading state after a failed save', () => {
    const measurement = {
      weight: 81.5,
      chest: null,
      waist: null,
      neck: null,
      bicepsLeft: null,
      bicepsRight: null,
      thighLeft: null,
      thighRight: null,
      calfLeft: null,
      calfRight: null,
    };
    store.loadMeasurement(date);
    http.expectOne(`/api/measurements/${date}`).flush({
      id: '11111111-1111-4111-8111-111111111111',
      date,
      ...measurement,
    });
    vi.advanceTimersByTime(1000);
    store.saveMeasurement({
      date,
      request: { ...measurement, weight: 82 },
    });
    expect(store.measurementSaveInProgress()).toBe(true);
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      http
        .expectOne(`/api/measurements/${date}`)
        .flush(
          { message: 'Internal Server Error' },
          { status: 500, statusText: 'Internal Server Error' },
        );
      vi.advanceTimersByTime(1000);
      expect(store.measurementSaveInProgress()).toBe(false);
      expect(store.loadedDate()).toBe(date);
      expect(store.currentMeasurement()?.weight).toBe(81.5);
      expect(store.measurementHistoryStale()).toBe(false);
      http.expectNone('/api/measurements/dates');
      expect(consoleError).toHaveBeenCalledOnce();
    } finally {
      consoleError.mockRestore();
    }
  });
});
