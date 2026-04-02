import { fetchApi } from './client';
import { Question } from './types';

export const derived = {
  generateChapterBatch: (params: { board: string; classLevel: string; subjectId: string; book: string; chapter: string; questionsPerChapter?: number }): Promise<Question[]> =>
    fetchApi<Question[]>('/derived-questions/generate', {
      method: 'POST',
      body: JSON.stringify(params),
    }),

  getDerivedQuestions: (status?: string, chapter?: string): Promise<Question[]> => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (chapter) params.append('chapter', chapter);
    return fetchApi<Question[]>(`/derived-questions?${params.toString()}`, { method: 'GET' });
  },

  approve: (id: string, notes?: string): Promise<Question> =>
    fetchApi<Question>(`/derived-questions/${id}/approve`, {
      method: 'POST',
      body: JSON.stringify({ notes }),
    }),

  reject: (id: string, reason?: string): Promise<Question> =>
    fetchApi<Question>(`/derived-questions/${id}/reject`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  publishApproved: (chapter?: string): Promise<{ publishedCount: number; status: string }> =>
    fetchApi<{ publishedCount: number; status: string }>('/derived-questions/publish', {
      method: 'POST',
      body: JSON.stringify({ chapter }),
    }),
};
