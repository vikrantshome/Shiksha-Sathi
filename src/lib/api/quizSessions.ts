import { fetchApi } from './client';
import type {
  JoinQuizSessionResponse,
  QuizAnswerResponse,
  QuizSession,
  QuizSessionReportDTO,
  StudentQuizSessionStateDTO,
  TeacherQuizSessionStateDTO,
} from './types';

export const quizSessions = {
  join: (sessionCode: string): Promise<JoinQuizSessionResponse> =>
    fetchApi<JoinQuizSessionResponse>('/quiz-sessions/join', {
      method: 'POST',
      body: JSON.stringify({ sessionCode }),
    }),

  getState: (sessionId: string): Promise<StudentQuizSessionStateDTO> =>
    fetchApi<StudentQuizSessionStateDTO>(`/quiz-sessions/${sessionId}/state`, { method: 'GET' }),

  submitAnswer: (sessionId: string, answer: string): Promise<QuizAnswerResponse> =>
    fetchApi<QuizAnswerResponse>(`/quiz-sessions/${sessionId}/answer`, {
      method: 'POST',
      body: JSON.stringify({ answer }),
    }),

  getTeacherState: (sessionId: string): Promise<TeacherQuizSessionStateDTO> =>
    fetchApi<TeacherQuizSessionStateDTO>(`/quiz-sessions/${sessionId}/teacher-state`, { method: 'GET' }),

  lock: (sessionId: string, locked: boolean): Promise<QuizSession> =>
    fetchApi<QuizSession>(`/quiz-sessions/${sessionId}/lock`, {
      method: 'POST',
      body: JSON.stringify({ locked }),
    }),

  start: (sessionId: string): Promise<QuizSession> =>
    fetchApi<QuizSession>(`/quiz-sessions/${sessionId}/start`, { method: 'POST' }),

  reveal: (sessionId: string): Promise<QuizSession> =>
    fetchApi<QuizSession>(`/quiz-sessions/${sessionId}/reveal`, { method: 'POST' }),

  next: (sessionId: string): Promise<QuizSession> =>
    fetchApi<QuizSession>(`/quiz-sessions/${sessionId}/next`, { method: 'POST' }),

  end: (sessionId: string): Promise<QuizSession> =>
    fetchApi<QuizSession>(`/quiz-sessions/${sessionId}/end`, { method: 'POST' }),

  report: (sessionId: string): Promise<QuizSessionReportDTO> =>
    fetchApi<QuizSessionReportDTO>(`/quiz-sessions/${sessionId}/report`, { method: 'GET' }),
};

