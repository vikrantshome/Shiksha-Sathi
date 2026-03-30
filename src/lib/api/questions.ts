import { fetchApi } from './client';
import { Question } from './types';

export const questions = {
  getSubjects: (): Promise<string[]> => 
    fetchApi<string[]>('/questions/subjects', { method: 'GET' }),

  getBoards: (): Promise<string[]> =>
    fetchApi<string[]>('/questions/boards', { method: 'GET' }),

  getClasses: (board?: string): Promise<string[]> => {
    const params = new URLSearchParams();
    if (board) params.append('board', board);
    return fetchApi<string[]>(`/questions/classes?${params.toString()}`, { method: 'GET' });
  },

  getBooks: (filters: { board?: string; classLevel?: string; subject?: string }): Promise<string[]> => {
    const params = new URLSearchParams();
    if (filters.board) params.append('board', filters.board);
    if (filters.classLevel) params.append('classLevel', filters.classLevel);
    if (filters.subject) params.append('subject', filters.subject);
    return fetchApi<string[]>(`/questions/books?${params.toString()}`, { method: 'GET' });
  },

  getChapters: (subjectId?: string, book?: string, classLevel?: string): Promise<string[]> => {
    const params = new URLSearchParams();
    if (subjectId) params.append('subjectId', subjectId);
    if (book) params.append('book', book);
    if (classLevel) params.append('classLevel', classLevel);
    return fetchApi<string[]>(`/questions/chapters?${params.toString()}`, { method: 'GET' });
  },

  search: (filters: {
    board?: string | null;
    classLevel?: string | null;
    subjectId?: string | null;
    book?: string | null;
    chapter?: string | null;
    q?: string | null;
    type?: string | null;
    approvedOnly?: boolean;
    visibleOnly?: boolean;
  }): Promise<Question[]> => {
    const params = new URLSearchParams();
    if (filters.board) params.append('board', filters.board);
    if (filters.classLevel) params.append('classLevel', filters.classLevel);
    if (filters.subjectId) params.append('subjectId', filters.subjectId);
    if (filters.book) params.append('book', filters.book);
    if (filters.chapter) params.append('chapter', filters.chapter);
    if (filters.q) params.append('q', filters.q);
    if (filters.type && filters.type !== 'ALL') params.append('type', filters.type);
    if (filters.visibleOnly) params.append('visibleOnly', 'true');
    else if (filters.approvedOnly) params.append('approvedOnly', 'true');

    return fetchApi<Question[]>(`/questions/search?${params.toString()}`, { method: 'GET' });
  },

  create: (question: Partial<Question>): Promise<Question> =>
    fetchApi<Question>('/questions', {
      method: 'POST',
      body: JSON.stringify(question),
    }),
};
