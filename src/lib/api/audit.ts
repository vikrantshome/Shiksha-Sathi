import { fetchApi } from './client';
import { Question } from './types';

export interface AuditResult {
  id?: string;
  questionId: string;
  classLevel: number | null;
  chapter: string;
  subject: string;
  auditStatus: 'ok' | 'needs_fix' | 'fixed' | 'error';
  issues: string[];
  autoFixes: Record<string, unknown>;
  recommendation: string;
  dbStatus: string;
  questionText: string;
  questionType: string;
  correctAnswer: string | null;
  questionOptions: string[];
  explanation: string;
  auditedAt: string;
  appliedAt: string | null;
  appliedBy: string | null;
  auditRunId: string;
}

export interface AuditStatistics {
  total: number;
  ok: number;
  needsFix: number;
  error: number;
  byChapter: Record<string, { total: number; ok: number; needsFix: number; error: number }>;
}

export interface AuditJob {
  id?: string;
  classLevel?: number;
  status?: string;
  startedAt?: string;
  completedAt?: string;
  totalCount?: number;
  processedCount?: number;
  auditRunId?: string;
  stdout?: string;
  stderr?: string;
}

export const audit = {
  getResults: (params?: {
    classLevel?: number;
    chapter?: string;
    status?: string;
  }): Promise<AuditResult[]> => {
    const searchParams = new URLSearchParams();
    if (params?.classLevel) searchParams.append('classLevel', params.classLevel.toString());
    if (params?.chapter) searchParams.append('chapter', params.chapter);
    if (params?.status) searchParams.append('status', params.status);
    return fetchApi<AuditResult[]>(`/audit-results?${searchParams.toString()}`, { method: 'GET' });
  },

  getStatistics: (params?: {
    classLevel?: number;
    chapter?: string;
  }): Promise<AuditStatistics> => {
    const searchParams = new URLSearchParams();
    if (params?.classLevel) searchParams.append('classLevel', params.classLevel.toString());
    if (params?.chapter) searchParams.append('chapter', params.chapter);
    return fetchApi<AuditStatistics>(`/audit-results/statistics?${searchParams.toString()}`, { method: 'GET' });
  },

  applyFix: (questionId: string, appliedBy?: string): Promise<Question> =>
    fetchApi<Question>('/audit-results/apply-fix', {
      method: 'POST',
      body: JSON.stringify({ questionId, appliedBy: appliedBy || 'admin' }),
    }),

  reject: (questionId: string, reason?: string): Promise<Question> =>
    fetchApi<Question>('/audit-results/reject', {
      method: 'POST',
      body: JSON.stringify({ questionId, reason: reason || 'Rejected via audit' }),
    }),

  bulkApplyFixes: (
    questionIds: string[],
    appliedBy?: string
  ): Promise<{ appliedCount: number; status: string }> =>
    fetchApi<{ appliedCount: number; status: string }>('/audit-results/bulk-apply-fix', {
      method: 'POST',
      body: JSON.stringify({ questionIds, appliedBy: appliedBy || 'admin' }),
    }),

  bulkReject: (
    questionIds: string[],
    reason?: string
  ): Promise<{ rejectedCount: number; status: string }> =>
    fetchApi<{ rejectedCount: number; status: string }>('/audit-results/bulk-reject', {
      method: 'POST',
      body: JSON.stringify({
        questionIds,
        reason: reason || 'Bulk rejected via audit',
      }),
    }),

  deleteByRunId: (runId: string): Promise<{ status: string; deletedRunId: string }> =>
    fetchApi<{ status: string; deletedRunId: string }>(`/audit-results/run/${runId}`, {
      method: 'DELETE',
    }),

  // Audit job management
  runAudit: (classLevel: number): Promise<AuditJob> =>
    fetchApi<AuditJob>('/audit/run', {
      method: 'POST',
      body: JSON.stringify({ classLevel }),
    }),

  getJobs: (): Promise<AuditJob[]> =>
    fetchApi<AuditJob[]>('/audit/jobs', { method: 'GET' }),

  getJob: (id: string): Promise<AuditJob> =>
    fetchApi<AuditJob>(`/audit/jobs/${id}`, { method: 'GET' }),

  cancelJob: (id: string): Promise<void> =>
    fetchApi<void>(`/audit/jobs/${id}/cancel`, { method: 'POST' }),

  deleteJob: (id: string): Promise<void> =>
    fetchApi<void>(`/audit/jobs/${id}`, { method: 'DELETE' }),
};