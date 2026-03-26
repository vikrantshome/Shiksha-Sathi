import { fetchApi } from './client';
import { Assignment, AssignmentSubmission, AssignmentWithStats, AssignmentReport } from './types';

export const assignments = {
  getStats: (teacherId: string): Promise<AssignmentWithStats[]> => 
    fetchApi<AssignmentWithStats[]>(`/assignments/teacher/${teacherId}/stats`, { method: 'GET' }),

  getAssignment: (assignmentId: string): Promise<Assignment> => 
    fetchApi<Assignment>(`/assignments/${assignmentId}`, { method: 'GET' }),

  getReport: (assignmentId: string): Promise<AssignmentReport> => 
    fetchApi<AssignmentReport>(`/assignments/${assignmentId}/report`, { method: 'GET' }),

  getSubmissions: (assignmentId: string): Promise<AssignmentSubmission[]> => 
    fetchApi<AssignmentSubmission[]>(`/assignment-submissions/assignment/${assignmentId}`, { method: 'GET' }),

  create: (data: Partial<Assignment>): Promise<Assignment> => 
    fetchApi<Assignment>('/assignments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  publish: (assignmentId: string): Promise<Assignment> => 
    fetchApi<Assignment>(`/assignments/${assignmentId}/publish`, { method: 'POST' }),

  getByLinkId: (linkId: string): Promise<any> =>
    fetchApi<any>(`/assignments/link/${linkId}`, { method: 'GET' }),

  submitAssignment: (assignmentId: string, studentName: string, studentRollNumber: string, answers: Record<string, string>): Promise<any> =>
    fetchApi<any>('/submissions', {
      method: 'POST',
      body: JSON.stringify({
        assignmentId,
        studentId: studentRollNumber, // Mapping rollNumber to studentId for temporary MVP
        answers,
        submittedAt: new Date().toISOString()
      }),
    }),
};
