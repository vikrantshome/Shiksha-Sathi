'use client';

import { useState, useEffect, useCallback } from 'react';
import { audit, type AuditStats, type AuditQueueItem, type AuditRunRequest } from '@/lib/api/audit';

const CLASSES = [6, 7, 8, 9, 10, 11, 12];
const SUBJECTS = ['Science', 'Mathematics', 'English', 'Physics', 'Biology', 'Chemistry', 'Social Science'];
const FIX_MODES = ['placeholder_answer', 'corrupted_control_chars', 'empty_explanation', 'mcq_options', 'ncert_source_missing', 'answer_verification_failed', 'ncert_low_confidence_match'];

export default function AuditPage() {
  const [stats, setStats] = useState<AuditStats | null>(null);
  const [queue, setQueue] = useState<AuditQueueItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [runLoading, setRunLoading] = useState(false);

  const [showRunModal, setShowRunModal] = useState(false);
  const [runParams, setRunParams] = useState<AuditRunRequest>({
    mode: 'check',
    limit: 100,
    enableNcert: false,
  });
  const [runOutput, setRunOutput] = useState<string | null>(null);

  const fetchStats = useCallback(async () => {
    try {
      const data = await audit.getStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, []);

  const fetchQueue = useCallback(async () => {
    setLoading(true);
    try {
      const data = await audit.getQueue();
      setQueue(data);
    } catch (err) {
      console.error('Failed to fetch queue:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    fetchQueue();
  }, [fetchStats, fetchQueue]);

  const handleRunAudit = async () => {
    setRunLoading(true);
    setRunOutput(null);
    try {
      const output = await audit.runAudit(runParams);
      setRunOutput(output);
      await fetchStats();
      await fetchQueue();
    } catch (err) {
      console.error('Failed to run audit:', err);
      setRunOutput(err instanceof Error ? err.message : 'Failed to run audit');
    } finally {
      setRunLoading(false);
    }
  };

  const handleApprove = async (queueItemId: string) => {
    try {
      await audit.approveFix(queueItemId);
      await fetchStats();
      await fetchQueue();
    } catch (err) {
      console.error('Failed to approve fix:', err);
    }
  };

  const handleReject = async (queueItemId: string) => {
    try {
      await audit.rejectFix(queueItemId);
      await fetchStats();
      await fetchQueue();
    } catch (err) {
      console.error('Failed to reject fix:', err);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'text-green-600';
    if (confidence >= 0.5) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="container mx-auto p-6 md:p-8">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">Audit Dashboard</h1>
          <p className="text-on-surface-variant mt-1">
            Review flagged questions and apply or reject suggested fixes.
          </p>
        </div>
        <button
          onClick={() => {
            setShowRunModal(true);
            setRunOutput(null);
          }}
          className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:opacity-90 transition shadow-lg"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Run Audit
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[var(--color-surface-container)] rounded-lg p-4">
          <div className="text-sm text-on-surface-variant">Invalid Questions</div>
          <div className="text-2xl font-bold">{stats?.totalInvalidQuestions ?? 0}</div>
        </div>
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4">
          <div className="text-sm text-yellow-700 dark:text-yellow-400">Pending Review</div>
          <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
            {stats?.pendingReview ?? 0}
          </div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="text-sm text-green-700 dark:text-green-400">Auto Applied</div>
          <div className="text-2xl font-bold text-green-700 dark:text-green-400">
            {stats?.autoApplied ?? 0}
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <div className="text-sm text-red-700 dark:text-red-400">Manual Review Needed</div>
          <div className="text-2xl font-bold text-red-700 dark:text-red-400">
            {stats?.manualReviewNeeded ?? 0}
          </div>
        </div>
      </div>

      <div className="bg-[var(--color-surface-container)] rounded-lg overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--color-outline_variant)] flex items-center justify-between">
          <h2 className="text-lg font-semibold text-on-surface">Review Queue</h2>
          <button
            onClick={fetchQueue}
            disabled={loading}
            className="px-3 py-1.5 text-sm bg-primary text-primary-on rounded-lg hover:opacity-90 transition disabled:opacity-50"
          >
            {loading ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--color-surface-container-high)]">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-on-surface-variant">
                  Question
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-on-surface-variant">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-on-surface-variant">
                  Suggested Fix
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-on-surface-variant">
                  Confidence
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-on-surface-variant">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-on-surface-variant">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-outline_variant)]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-on-surface-variant">
                    Loading...
                  </td>
                </tr>
              ) : queue.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-on-surface-variant">
                    No pending review items. Run an audit to populate the queue.
                  </td>
                </tr>
              ) : (
                queue.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-[var(--color-surface-container-high)]/50"
                  >
                    <td className="px-4 py-3 text-sm min-w-[250px] max-w-md" title={item.questionText}>
                      {item.questionText || '—'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">
                        {item.originalType}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-on-surface-variant min-w-[200px] max-w-sm">
                      {typeof item.suggestedFix === 'string'
                        ? item.suggestedFix
                        : JSON.stringify(item.suggestedFix)}
                    </td>
                    <td className={`px-4 py-3 text-sm font-medium ${getConfidenceColor(item.confidence)}`}>
                      {Math.round(item.confidence * 100)}%
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-800">
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleApprove(item.id)}
                          className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReject(item.id)}
                          className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showRunModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[var(--color-surface-container)] rounded-lg p-6 w-[28rem] max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4 text-on-surface">Run Audit</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">
                  Mode
                </label>
                <select
                  value={runParams.mode}
                  onChange={(e) =>
                    setRunParams({ ...runParams, mode: e.target.value as 'check' | 'fix' })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-outline)] bg-[var(--color-surface)] text-on-surface"
                >
                  <option value="check">Check only</option>
                  <option value="fix">Check + queue fixes</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">
                  Class
                </label>
                <select
                  value={runParams.classLevel || ''}
                  onChange={(e) =>
                    setRunParams({
                      ...runParams,
                      classLevel: e.target.value ? Number(e.target.value) : undefined,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-outline)] bg-[var(--color-surface)] text-on-surface"
                >
                  <option value="">All Classes</option>
                  {CLASSES.map((c) => (
                    <option key={c} value={c}>
                      Class {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">
                  Subject
                </label>
                <select
                  value={runParams.subject || ''}
                  onChange={(e) =>
                    setRunParams({
                      ...runParams,
                      subject: e.target.value || undefined,
                    })
                  }
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-outline)] bg-[var(--color-surface)] text-on-surface"
                >
                  <option value="">All Subjects</option>
                  {SUBJECTS.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              {runParams.mode === 'fix' && (
                <div>
                  <label className="block text-sm font-medium text-on-surface-variant mb-1">
                    Fix Mode (optional)
                  </label>
                  <select
                    value={runParams.fixMode || ''}
                    onChange={(e) =>
                      setRunParams({
                        ...runParams,
                        fixMode: e.target.value || undefined,
                      })
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[var(--color-outline)] bg-[var(--color-surface)] text-on-surface"
                  >
                    <option value="">All fix types</option>
                    {FIX_MODES.map((f) => (
                      <option key={f} value={f}>
                        {f}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="enableNcert"
                  checked={runParams.enableNcert || false}
                  onChange={(e) =>
                    setRunParams({ ...runParams, enableNcert: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <label htmlFor="enableNcert" className="text-sm text-on-surface-variant">
                  Verify against NCERT sources (slower)
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-on-surface-variant mb-1">
                  Limit
                </label>
                <input
                  type="number"
                  value={runParams.limit}
                  onChange={(e) =>
                    setRunParams({
                      ...runParams,
                      limit: Number(e.target.value),
                    })
                  }
                  min={1}
                  max={1000}
                  className="w-full px-3 py-2 rounded-lg border border-[var(--color-outline)] bg-[var(--color-surface)] text-on-surface"
                />
              </div>

              {runOutput && (
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                  <h4 className="text-xs font-medium text-gray-500 mb-1">Output</h4>
                  <pre className="text-xs whitespace-pre-wrap text-on-surface">{runOutput}</pre>
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 mt-6">
              <button
                onClick={() => setShowRunModal(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300 transition"
              >
                Close
              </button>
              <button
                onClick={handleRunAudit}
                disabled={runLoading}
                className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50"
              >
                {runLoading ? 'Running...' : 'Start Audit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
