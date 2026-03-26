export type Role = 'PARTNER' | 'ADMIN' | 'TEACHER' | 'STUDENT' | 'PARENT';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: Role;
}

export interface AuthResponse {
  token: string;
  userId: string;
  name: string;
  role: Role;
}

export interface ApiError {
  message: string;
  status?: number;
}

export interface ProfileRequest {
  name: string;
  school: string;
  board: string;
}

export interface ProfileResponse extends ProfileRequest {
  userId: string;
}

export interface ClassItem {
  id: string;
  name: string;
  section: string;
  studentCount: number;
  active: boolean;
  schoolId: string;
  teacherIds: string[];
  studentIds: string[];
}

export interface ClassRequest {
  name: string;
  section: string;
  studentCount: number;
}
