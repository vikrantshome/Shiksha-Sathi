import { fetchApi } from './client';
import type { QuizAttemptStartResponse, SubmitAssignmentResponse } from './types';

export const quizAttempts = {
  start: (quizId: string): Promise<QuizAttemptStartResponse> =>
    fetchApi<QuizAttemptStartResponse>('/quiz-attempts', {
      method: 'POST',
      body: JSON.stringify({ quizId }),
    }),

  submit: (attemptId: string, answers: Record<string, string>): Promise<SubmitAssignmentResponse> =>
    fetchApi<SubmitAssignmentResponse>(`/quiz-attempts/${attemptId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    }),
};

