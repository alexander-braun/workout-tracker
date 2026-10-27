import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import {
  catchError,
  EMPTY,
  exhaustMap,
  finalize,
  pipe,
  switchMap,
  tap,
} from 'rxjs';
import { type LoginRequest, type AuthState, type RegisterRequest } from '../auth.model';
import { AuthApiService } from '../auth-api.service';
import { type HttpErrorResponse } from '@angular/common/http';

const initialState: AuthState = {
  user: null,
  initialized: false,
  loading: false,

  loginInProgress: false,
  loginError: null,

  registerInProgress: false,
  registerError: null,
};

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState<AuthState>(initialState),
  withComputed((store) => ({
    authenticated: computed(() => store.user() !== null),
  })),
  withMethods((store, api = inject(AuthApiService)) => {
    return {
      loadCurrentUser: rxMethod<void>(
        pipe(
          tap(() => patchState(store, { loading: true })),
          switchMap(() =>
            api.getCurrentUser().pipe(
              tap((user) =>
                patchState(store, {
                  user,
                  initialized: true,
                }),
              ),
              catchError(() => {
                patchState(store, {
                  user: null,
                  initialized: true,
                });
                return EMPTY;
              }),
              finalize(() => patchState(store, { loading: false })),
            ),
          ),
        ),
      ),

      logout: rxMethod<void>(
        pipe(
          switchMap(() =>
            api.logout().pipe(
              tap(() => {
                patchState(store, {
                  user: null,
                  initialized: true,
                });
              }),
              catchError((error) => {
                console.error('Logout failed', error);
                return EMPTY;
              }),
            ),
          ),
        ),
      ),

      login: rxMethod<LoginRequest>(
        pipe(
          exhaustMap((request) => {
            patchState(store, {
              loginInProgress: true,
              loginError: null,
            });

            return api.login(request).pipe(
              tap((user) => {
                patchState(store, {
                  user,
                  initialized: true,
                });
              }),
              catchError((error: HttpErrorResponse) => {
                patchState(store, {
                  loginError:
                    error.status === 401
                      ? 'Invalid email or password.'
                      : 'Login failed. Please try again.',
                });
                return EMPTY;
              }),
              finalize(() => {
                patchState(store, {
                  loginInProgress: false,
                });
              }),
            );
          }),
        ),
      ),

      register: rxMethod<RegisterRequest>(
        pipe(
          exhaustMap((request) => {
            patchState(store, {
              registerInProgress: true,
              registerError: null,
            });
            return api.register(request).pipe(
              switchMap(() =>
                api.login({
                  email: request.email,
                  password: request.password,
                }),
              ),
              tap((user) => {
                patchState(store, {
                  user,
                  initialized: true,
                });
              }),
              catchError((error: HttpErrorResponse) => {
                patchState(store, {
                  registerError:
                    error.status === 409
                      ? 'An account with this email already exists.'
                      : 'Registration failed. Please try again.',
                });
                return EMPTY;
              }),
              finalize(() => {
                patchState(store, {
                  registerInProgress: false,
                });
              }),
            );
          }),
        ),
      ),
    };
  }),
);
