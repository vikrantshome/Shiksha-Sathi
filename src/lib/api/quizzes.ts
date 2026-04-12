import { fetchApi } from './client';
import type { Quiz, StartQuizSessionResponse, StudentQuizDTO } from './types';

export const quizzes = {
  create: (data: {
    title: string;
    description?: string;
    classId: string;
    questionIds: string[];
    questionPointsMap?: Record<string, number>;
    timePerQuestionSec?: number;
  }): Promise<Quiz> =>
    fetchApi<Quiz>('/quizzes', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  listForTeacher: (teacherId: string): Promise<Quiz[]> =>
    fetchApi<Quiz[]>(`/quizzes/teacher/${teacherId}`, { method: 'GET' }),

  getById: (quizId: string): Promise<Quiz> =>
    fetchApi<Quiz>(`/quizzes/${quizId}`, { method: 'GET' }),

  publishSelfPaced: (quizId: string): Promise<Quiz> =>
    fetchApi<Quiz>(`/quizzes/${quizId}/publish-self-paced`, { method: 'POST' }),

  startSession: (quizId: string): Promise<StartQuizSessionResponse> =>
    fetchApi<StartQuizSessionResponse>(`/quizzes/${quizId}/start-session`, { method: 'POST' }),

  getByCode: (code: string): Promise<StudentQuizDTO> =>
    fetchApi<StudentQuizDTO>(`/quizzes/code/${code}`, { method: 'GET' }),
};

