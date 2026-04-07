import { fetchApi } from './client';
import {
  Assignment,
  AssignmentByLinkResponse,
  AssignmentReport,
  AssignmentSubmission,
  AssignmentWithStats,
  SubmitAssignmentResponse,
} from './types';

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

  getByLinkId: (linkId: string): Promise<AssignmentByLinkResponse> =>
    fetchApi<AssignmentByLinkResponse>(`/assignments/link/${linkId}`, {
      method: 'GET',
    }),

  submitAssignment: (
    assignmentId: string,
    studentName: string,
    studentRollNumber: string,
    school: string,
    studentClass: string,
    section: string,
    answers: Record<string, string>
  ): Promise<SubmitAssignmentResponse> =>
    fetchApi<SubmitAssignmentResponse>('/submissions', {
      method: 'POST',
      body: JSON.stringify({
        assignmentId,
        studentName,
        studentId: studentRollNumber,
        school,
        studentClass,
        section,
        answers,
        submittedAt: new Date().toISOString(),
      }),
    }),
};
