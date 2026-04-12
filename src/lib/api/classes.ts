import { fetchApi } from './client';
import { ClassItem, ClassRequest, User, AttendanceRecord } from './types';

export const classes = {
  getClasses: (): Promise<ClassItem[]> => 
    fetchApi<ClassItem[]>('/classes/me', { method: 'GET' }),

  getClass: (classId: string): Promise<ClassItem> => 
    fetchApi<ClassItem>(`/classes/${classId}`, { method: 'GET' }),

  getStudents: (classId: string): Promise<User[]> => 
    fetchApi<User[]>(`/classes/${classId}/students`, { method: 'GET' }),

  addStudents: (classId: string, studentIds: string[]): Promise<void> => 
    fetchApi<void>(`/classes/${classId}/students`, {
      method: 'POST',
      body: JSON.stringify({ studentIds }),
    }),

  createClass: (data: ClassRequest): Promise<ClassItem> => 
    fetchApi<ClassItem>('/classes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  archiveClass: (classId: string): Promise<ClassItem> => 
    fetchApi<ClassItem>(`/classes/${classId}/archive`, { method: 'PATCH' }),

  deleteClass: (classId: string): Promise<void> => 
    fetchApi<void>(`/classes/${classId}`, { method: 'DELETE' }),

  getAttendance: (classId: string, date: string): Promise<AttendanceRecord[]> => 
    fetchApi<AttendanceRecord[]>(`/classes/${classId}/attendance?date=${date}`, { method: 'GET' }),

  markAttendance: (classId: string, studentId: string, date: string, status: string): Promise<AttendanceRecord> => 
    fetchApi<AttendanceRecord>(`/classes/${classId}/attendance`, {
      method: 'POST',
      body: JSON.stringify({ studentId, date, status }),
    }),

  enrollStudent: (classId: string, data: { name: string; phone: string; birthDate: string }): Promise<ClassItem> =>
    fetchApi<ClassItem>(`/classes/${classId}/enroll`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  removeStudent: (classId: string, studentId: string): Promise<ClassItem> =>
    fetchApi<ClassItem>(`/classes/${classId}/students/${studentId}`, {
      method: 'DELETE',
    }),

  markBulkAttendance: (classId: string, date: string, status: string): Promise<AttendanceRecord[]> =>
    fetchApi<AttendanceRecord[]>(`/classes/${classId}/attendance/bulk`, {
      method: 'POST',
      body: JSON.stringify({ date, status }),
    }),

  getAttendanceHistory: (classId: string, startDate: string, endDate: string): Promise<AttendanceRecord[]> =>
    fetchApi<AttendanceRecord[]>(`/classes/${classId}/attendance/history?startDate=${startDate}&endDate=${endDate}`, {
      method: 'GET',
    }),

  getStudentAttendance: (studentId: string, startDate: string, endDate: string): Promise<AttendanceRecord[]> =>
    fetchApi<AttendanceRecord[]>(`/classes/student/${studentId}/attendance?startDate=${startDate}&endDate=${endDate}`, {
      method: 'GET',
    }),
};
