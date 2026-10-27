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

  it('initializes the authenticated user', () => {
    const fixture = TestBed.createComponent(App);

    http.expectOne('/api/auth/me').flush({
      id: '11111111-1111-4111-8111-111111111111',
      email: 'test@example.com',
      createdAt: '2026-10-12T10:00:00Z',
    });

    fixture.detectChanges();

    expect(authStore.initialized()).toBe(true);
    expect(authStore.authenticated()).toBe(true);
  });
});
