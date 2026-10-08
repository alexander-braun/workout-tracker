import { type CurrentUserResponse } from '../../api/generated/api-types';

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface RegisterResponse {
  id: string;
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthState {
  user: CurrentUserResponse | null;
  initialized: boolean;
  loading: boolean;

  loginInProgress: boolean;
  loginError: string | null;

  registerInProgress: boolean;
  registerError: string | null;
}
