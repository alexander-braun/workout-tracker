import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { App } from './app';
import { AuthStore } from './features/auth/store/auth.store';

describe('App', () => {
  let http: HttpTestingController;
  let authStore: InstanceType<typeof AuthStore>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideRouter([]), provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    authStore = TestBed.inject(AuthStore);
  });

  afterEach(() => {
    http.verify();
  });

  it('does not load tracker data when unauthenticated', () => {
    const fixture = TestBed.createComponent(App);
    http.expectOne('/api/auth/me').flush({}, { status: 401, statusText: 'Unauthorized' });
    fixture.detectChanges();
    expect(authStore.initialized()).toBe(true);
    expect(authStore.authenticated()).toBe(false);
    http.expectNone('/api/workouts/dates');
    http.expectNone('/api/measurements/dates');
    http.expectNone('/api/nutrition/dates');
  });

  it('loads tracker dates when authenticated', () => {
    const fixture = TestBed.createComponent(App);
    http.expectOne('/api/auth/me').flush({
      id: '11111111-1111-4111-8111-111111111111',
      email: 'test@example.com',
      createdAt: '2026-10-12T10:00:00Z',
    });
    fixture.detectChanges();
    expect(authStore.initialized()).toBe(true);
    expect(authStore.authenticated()).toBe(true);
    http.expectOne('/api/workouts/dates').flush({
      dates: [],
    });
    http.expectOne('/api/measurements/dates').flush({
      dates: [],
    });
    http.expectOne('/api/nutrition/dates').flush({
      dates: [],
    });
  });
});
