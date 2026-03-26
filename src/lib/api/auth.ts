import { fetchApi } from './client';
import { AuthResponse, User, Role } from './types';

export interface LoginRequest {
  email?: string;
  phone?: string;
  password?: string;
}

export interface SignupRequest {
  name: string;
  email: string;
  phone: string;
  password?: string;
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
