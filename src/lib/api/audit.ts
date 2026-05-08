import { fetchApi } from './client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

function getToken(): string | undefined {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('shiksha-sathi-token') ?? undefined;
  }
  return undefined;
}

export interface AuditStats {
  totalInvalidQuestions: number;
  pendingReview: number;
  autoApplied: number;
  manualReviewNeeded: number;
}

export interface AuditQueueItem {
  id: string;
  questionId: string;
  questionText: string;
  originalType: string;
  suggestedFix: Record<string, unknown>;
  confidence: number;
  status: string;
}

export interface AuditRunRequest {
  mode?: 'check' | 'fix';
  limit?: number;
  classLevel?: number;
  subject?: string;
  fixMode?: string;
  enableNcert?: boolean;
}

export const audit = {
  getStats: (): Promise<AuditStats> =>
    fetchApi<AuditStats>('/admin/audit/stats', { method: 'GET' }),

  getQueue: (): Promise<AuditQueueItem[]> =>
    fetchApi<AuditQueueItem[]>('/admin/audit/queue', { method: 'GET' }),

  runAudit: async (request: AuditRunRequest): Promise<string> => {
    const token = getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/admin/audit/run`, {
      method: 'POST',
      headers,
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const text = await response.text().catch(() => response.statusText);
      throw new Error(text || `Server error (${response.status})`);
    }

    return response.text();
  },

  approveFix: (queueItemId: string): Promise<void> =>
    fetchApi<void>(`/admin/audit/approve/${queueItemId}`, { method: 'POST' }),

  rejectFix: (queueItemId: string): Promise<void> =>
    fetchApi<void>(`/admin/audit/reject/${queueItemId}`, { method: 'POST' }),
};
