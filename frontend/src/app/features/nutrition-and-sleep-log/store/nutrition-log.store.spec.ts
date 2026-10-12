import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { NutritionLogStore } from './nutrition-log.store';

describe('NutritionLogStore', () => {
  let store: InstanceType<typeof NutritionLogStore>;
  let http: HttpTestingController;

  const date = '2026-10-12';

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    store = TestBed.inject(NutritionLogStore);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
  });

  it('loads a nutrition entry for a date', () => {
    const entry = {
      id: '11111111-1111-4111-8111-111111111111',
      date,
      calories: 2400,
      protein: 140,
      sleepHours: 8,
      steps: 8000,
      sleepQuality: 4,
      energy: 4,
      notes: null,
    };
    store.loadNutritionEntry(date);
    expect(store.nutritionEntryLoading()).toBe(true);
    expect(store.loadedDate()).toBeNull();
    const request = http.expectOne(`/api/nutrition/${date}`);
    expect(request.request.method).toBe('GET');
    request.flush(entry);
    expect(store.nutritionEntryLoading()).toBe(false);
    expect(store.loadedDate()).toBe(date);
    expect(store.currentNutritionEntry()).toEqual(entry);
  });

  it('cancels the previous request when switching dates', () => {
    const firstDate = '2026-10-11';
    const secondDate = '2026-10-12';
    store.loadNutritionEntry(firstDate);
    const firstRequest = http.expectOne(`/api/nutrition/${firstDate}`);
    store.loadNutritionEntry(secondDate);
    expect(firstRequest.cancelled).toBe(true);
    const secondRequest = http.expectOne(`/api/nutrition/${secondDate}`);
    secondRequest.flush({
      id: null,
      date: secondDate,
    });
    expect(store.loadedDate()).toBe(secondDate);
    expect(store.nutritionEntryLoading()).toBe(false);
    expect(store.currentNutritionEntry()).toBeNull();
  });

  it('does not mark nutrition as loaded when the request fails', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      store.loadNutritionEntry(date);
      http
        .expectOne(`/api/nutrition/${date}`)
        .flush(
          { message: 'Internal Server Error' },
          { status: 500, statusText: 'Internal Server Error' },
        );
      expect(store.nutritionEntryLoading()).toBe(false);
      expect(store.loadedDate()).toBeNull();
      expect(store.currentNutritionEntry()).toBeNull();
      store.saveNutritionEntry({
        date,
        request: {
          calories: 2400,
          protein: 140,
          sleepHours: 8,
          steps: null,
          sleepQuality: null,
          energy: null,
          notes: null,
        },
      });
      http.expectNone((req) => req.method === 'PUT');
      expect(consoleError).toHaveBeenCalledOnce();
    } finally {
      consoleError.mockRestore();
    }
  });

  it('saves nutrition data and refreshes related dates', () => {
    const entry = {
      calories: 2400,
      protein: 140,
      sleepHours: 8,
      steps: 8000,
      sleepQuality: 4,
      energy: 4,
      notes: null,
    };
    store.loadNutritionEntry(date);
    http.expectOne(`/api/nutrition/${date}`).flush({
      id: null,
      date,
    });
    store.saveNutritionEntry({ date, request: entry });
    expect(store.nutritionEntrySaveInProgress()).toBe(true);
    const saveRequest = http.expectOne(`/api/nutrition/${date}`);
    expect(saveRequest.request.method).toBe('PUT');
    expect(saveRequest.request.body).toEqual(entry);
    saveRequest.flush({
      id: '11111111-1111-4111-8111-111111111111',
      date,
      ...entry,
    });
    expect(store.currentNutritionEntry()?.calories).toBe(2400);
    expect(store.currentNutritionEntry()?.protein).toBe(140);
    expect(store.nutritionHistoryStale()).toBe(true);
    http.expectOne('/api/nutrition/dates').flush({
      dates: [date],
    });
    expect(store.nutritionDates()).toEqual([date]);
    expect(store.nutritionEntrySaveInProgress()).toBe(false);
  });

  it('preserves nutrition data and resets loading state after a failed save', () => {
    const entry = {
      calories: 2400,
      protein: 140,
      sleepHours: 8,
      steps: 8000,
      sleepQuality: 4,
      energy: 4,
      notes: null,
    };
    store.loadNutritionEntry(date);
    http.expectOne(`/api/nutrition/${date}`).flush({
      id: '11111111-1111-4111-8111-111111111111',
      date,
      ...entry,
    });
    store.saveNutritionEntry({
      date,
      request: { ...entry, calories: 2600 },
    });
    expect(store.nutritionEntrySaveInProgress()).toBe(true);
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    try {
      http
        .expectOne(`/api/nutrition/${date}`)
        .flush(
          { message: 'Internal Server Error' },
          { status: 500, statusText: 'Internal Server Error' },
        );
      expect(store.nutritionEntrySaveInProgress()).toBe(false);
      expect(store.loadedDate()).toBe(date);
      expect(store.currentNutritionEntry()?.calories).toBe(2400);
      expect(store.nutritionHistoryStale()).toBe(false);
      http.expectNone('/api/nutrition/dates');
      expect(consoleError).toHaveBeenCalledOnce();
    } finally {
      consoleError.mockRestore();
    }
  });
});
