import { fetchApi } from './client';
import { ClassItem, ClassRequest } from './types';

export const classes = {
  getClasses: (): Promise<ClassItem[]> => 
    fetchApi<ClassItem[]>('/classes/me', { method: 'GET' }),

  createClass: (data: ClassRequest): Promise<ClassItem> => 
    fetchApi<ClassItem>('/classes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  archiveClass: (classId: string): Promise<ClassItem> => 
    fetchApi<ClassItem>(`/classes/${classId}/archive`, { method: 'PATCH' }),

  deleteClass: (classId: string): Promise<void> => 
    fetchApi<void>(`/classes/${classId}`, { method: 'DELETE' }),
};
