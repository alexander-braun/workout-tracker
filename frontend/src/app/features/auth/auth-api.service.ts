import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import type { Observable } from 'rxjs';
import { switchMap } from 'rxjs';

import type { AuthUser, LoginRequest, RegisterRequest, RegisterResponse } from './auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthApiService {
  private readonly http = inject(HttpClient);

  register(request: RegisterRequest): Observable<RegisterResponse> {
    return this.http
      .get('/api/auth/csrf')
      .pipe(switchMap(() => this.http.post<RegisterResponse>('/api/auth/register', request)));
  }

  login(request: LoginRequest): Observable<AuthUser> {
    return this.http.get('/api/auth/csrf').pipe(
      switchMap(() => this.http.post<void>('/api/auth/login', request)),
      switchMap(() => this.http.get('/api/auth/csrf')),
      switchMap(() => this.getCurrentUser()),
    );
  }

  getCurrentUser(): Observable<AuthUser> {
    return this.http.get<AuthUser>('/api/auth/me');
  }

  logout(): Observable<void> {
    return this.http.post<void>('/api/auth/logout', {});
  }
}
