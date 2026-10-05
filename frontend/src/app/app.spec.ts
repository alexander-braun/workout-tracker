import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { App } from './app';

describe('App', () => {
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [provideHttpClient(), provideHttpClientTesting()],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

it('should create the app', () => {
  const fixture = TestBed.createComponent(App);

  fixture.detectChanges();

  httpTesting.expectOne('/api/workouts/dates').flush({
    dates: [],
  });

  httpTesting.expectOne('/api/exercises').flush([]);

  const workoutRequest = httpTesting.expectOne((request) =>
    request.url.startsWith('/api/workouts/'),
  );
  workoutRequest.flush({}, { status: 404, statusText: 'Not Found' });

  const measurementRequest = httpTesting.expectOne((request) =>
    request.url.startsWith('/api/measurements/'),
  );
  measurementRequest.flush({}, { status: 404, statusText: 'Not Found' });

  const nutritionRequest = httpTesting.expectOne((request) =>
    request.url.startsWith('/api/nutrition/'),
  );
  nutritionRequest.flush({}, { status: 404, statusText: 'Not Found' });

  expect(fixture.componentInstance).toBeTruthy();
});
});
