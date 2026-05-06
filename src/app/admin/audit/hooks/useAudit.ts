import { useState, useEffect } from 'react';

interface AuditStats {
  totalInvalidQuestions: number;
  pendingReview: number;
  autoApplied: number;
  manualReviewNeeded: number;
}

interface AuditQueueItem {
  id: string;
  questionId: string;
  questionText: string;
  originalType: string;
  suggestedFix: Record<string, unknown>;
  confidence: number;
  status: string;
}

export function useAudit() {
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [queue, setQueue] = useState<AuditQueueItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/v1/admin/audit/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
      setStats({ totalInvalidQuestions: 0, pendingReview: 0, autoApplied: 0, manualReviewNeeded: 0 });
    }
  };

  const fetchQueue = async () => {
    try {
      const res = await fetch('/api/v1/admin/audit/queue');
      if (res.ok) {
        const data = await res.json();
        setQueue(data);
      }
    } catch {
      setQueue([]);
    }
  };

  const runAudit = async (mode: 'full' | 'single' = 'full') => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/admin/audit/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode })
      });
      await res.text();
      await fetchStats();
      await fetchQueue();
    } catch (e) {
      console.error('Audit failed:', e);
    } finally {
      setLoading(false);
    }
  };

  const approveFix = async (queueItemId: string) => {
    await fetch(`/api/v1/admin/audit/approve/${queueItemId}`, { method: 'POST' });
    await fetchQueue();
    await fetchStats();
  };

  const rejectFix = async (queueItemId: string) => {
    await fetch(`/api/v1/admin/audit/reject/${queueItemId}`, { method: 'POST' });
    await fetchQueue();
    await fetchStats();
  };

  useEffect(() => {
    fetchStats();
    fetchQueue();
  }, []);

  return { stats, queue, loading, runAudit, approveFix, rejectFix, fetchStats, fetchQueue };
}