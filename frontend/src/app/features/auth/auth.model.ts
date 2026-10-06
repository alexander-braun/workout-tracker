export interface RegisterRequest {
  email: string;
  password: string;
}

export interface RegisterResponse {
  id: number;
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  id: number;
  email: string;
  // add username etc. if your /me endpoint returns it
}

export interface AuthState {
  user: AuthUser | null;
  initialized: boolean;
  loading: boolean;

  loginInProgress: boolean;
  loginError: string | null;

  registerInProgress: boolean;
  registerError: string | null;
}
