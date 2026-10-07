import { computed, inject } from '@angular/core';
import { patchState, signalStore, withComputed, withMethods, withState } from '@ngrx/signals';
import { rxMethod } from '@ngrx/signals/rxjs-interop';
import {
  catchError,
  EMPTY,
  finalize,
  type Observable,
  pipe,
  switchMap,
  tap,
  throwError,
} from 'rxjs';
import {
  type LoginRequest,
  type AuthState,
  type AuthUser,
  type RegisterRequest,
} from '../auth.model';
import { AuthApiService } from '../auth-api.service';
import { type HttpErrorResponse } from '@angular/common/http';
import { WorkoutLogStore } from '../../workout-log/store/workout-log.store';
import { NutritionLogStore } from '../../nutrition-and-sleep-log/store/nutrition-log.store';
import { BodyLogStore } from '../../body-log/store/body-log.store';

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
  withMethods(
    (
      store,
      api = inject(AuthApiService),
      workoutStore = inject(WorkoutLogStore),
      nutritionStore = inject(NutritionLogStore),
      bodyStore = inject(BodyLogStore),
    ) => {
      const loadCurrentUser = rxMethod<void>(
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
      );
      const logout = rxMethod<void>(
        pipe(
          switchMap(() =>
            api.logout().pipe(
              tap(() => {
                workoutStore.clearStore();
                nutritionStore.clearStore();
                bodyStore.clearStore();
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
      );
      return {
        loadCurrentUser,
        logout,
        login(request: LoginRequest): Observable<AuthUser> {
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
              return throwError(() => error);
            }),
            finalize(() => {
              patchState(store, {
                loginInProgress: false,
              });
            }),
          );
        },
        register(request: RegisterRequest): Observable<AuthUser> {
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
              return throwError(() => error);
            }),
            finalize(() => {
              patchState(store, {
                registerInProgress: false,
              });
            }),
          );
        },
      };
    },
  ),
);
