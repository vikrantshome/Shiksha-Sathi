import { fetchApi } from './client';
import { AuthResponse, User, Role } from './types';

export interface LoginRequest {
  email?: string;
  phone?: string;
  password?: string;
  /** When multiple users share the same phone (e.g., sibling students),
   * specify which user to authenticate by their userId. */
  selectUserId?: string;
}

export interface SignupRequest {
  name: string;
  email?: string;
  phone: string;
  password?: string;
  school: string;
  board?: string;
  // Student-specific fields
  rollNumber?: string;
  studentClass?: string;
  section?: string;
  role: Role;
}

export const auth = {
  login: (data: LoginRequest) => 
    fetchApi<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  signup: (data: SignupRequest) =>
    fetchApi<AuthResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMe: () =>
    fetchApi<User>('/auth/me', {
      method: 'GET',
    }),
};
