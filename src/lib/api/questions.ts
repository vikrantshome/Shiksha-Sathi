import { fetchApi } from './client';
import { Question } from './types';

export const questions = {
  getSubjects: (): Promise<string[]> => 
    fetchApi<string[]>('/questions/subjects', { method: 'GET' }),

  getChapters: (subjectId?: string): Promise<string[]> => {
    const params = new URLSearchParams();
    if (subjectId) params.append('subjectId', subjectId);
    return fetchApi<string[]>(`/questions/chapters?${params.toString()}`, { method: 'GET' });
  },

  search: (filters: { 
    subjectId?: string | null; 
    chapter?: string | null; 
    q?: string | null; 
    type?: string | null; 
  }): Promise<Question[]> => {
    const params = new URLSearchParams();
    if (filters.subjectId) params.append('subjectId', filters.subjectId);
    if (filters.chapter) params.append('chapter', filters.chapter);
    if (filters.q) params.append('q', filters.q);
    if (filters.type && filters.type !== 'ALL') params.append('type', filters.type);
    
    return fetchApi<Question[]>(`/questions/search?${params.toString()}`, { method: 'GET' });
  },

  create: (question: Partial<Question>): Promise<Question> =>
    fetchApi<Question>('/questions', {
      method: 'POST',
      body: JSON.stringify(question),
    }),
};
