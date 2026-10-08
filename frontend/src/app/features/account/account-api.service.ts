import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { type Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AccountApiService {
  private readonly http = inject(HttpClient);

  updateEmail(request: { email: string }): Observable<void> {
    return this.http.put<void>('/api/auth/email', request);
  }

  updatePassword(request: { currentPassword: string; newPassword: string }): Observable<void> {
    return this.http.put<void>('/api/auth/password', request);
  }

  deleteAccount(): Observable<void> {
    return this.http.delete<void>('/api/auth/me');
  }
}
