'use client';

import { useState, useEffect, useCallback } from 'react';
import { audit, type AuditResult, type AuditStatistics, type AuditJob } from '@/lib/api/audit';

const CLASSES = [6, 7, 8, 9, 10, 11, 12];
const ITEMS_PER_PAGE = 20;

export default function AuditPage() {
  const [stats, setStats] = useState<AuditStatistics | null>(null);
  const [results, setResults] = useState<AuditResult[]>([]);
  const [selectedClass, setSelectedClass] = useState<number | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  // Audit job UI state
  const [showRunModal, setShowRunModal] = useState(false);
  const [runClass, setRunClass] = useState<number | null>(null);
  const [jobs, setJobs] = useState<AuditJob[]>([]);
  const [classStatsMap, setClassStatsMap] = useState<Record<number, { total: number; ok: number; needsFix: number; error: number }>>({});
  const [questionCounts, setQuestionCounts] = useState<Record<number, number>>({});

  const fetchStats = useCallback(async () => {
    try {
      const data = await audit.getStatistics({
        classLevel: selectedClass || undefined,
        chapter: selectedChapter || undefined,
      });
      setStats(data);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  }, [selectedClass, selectedChapter]);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    try {
      const data = await audit.getResults({
        classLevel: selectedClass || undefined,
        chapter: selectedChapter || undefined,
        status: selectedStatus || undefined,
      });
      setResults(data);
      setTotalCount(data.length);
      setSelectedIds(new Set());
      setCurrentPage(1);
    } catch (err) {
      console.error('Failed to fetch results:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedClass, selectedChapter, selectedStatus]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    const fetchAllClassStats = async () => {
      const map: Record<number, { total: number; ok: number; needsFix: number; error: number }> = {};
      for (const cls of CLASSES.slice(0, 6)) {
        try {
          const data = await audit.getStatistics({ classLevel: cls });
          map[cls] = { total: data.total, ok: data.ok, needsFix: data.needsFix, error: data.error };
        } catch {
          map[cls] = { total: 0, ok: 0, needsFix: 0, error: 0 };
        }
      }
      setClassStatsMap(map);
    };
    fetchAllClassStats();
  }, []);

  useEffect(() => {
    const fetchQuestionCounts = async () => {
      try {
        const counts = await audit.getQuestionCountsByClass();
        const numCounts: Record<number, number> = {};
        for (const [cls, count] of Object.entries(counts)) {
          numCounts[parseInt(cls)] = count;
        }
        setQuestionCounts(numCounts);
      } catch (err) {
        console.error('Failed to fetch question counts:', err);
      }
    };
    fetchQuestionCounts();
  }, []);

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  const fetchJobs = useCallback(async () => {
    try {
      const data = await audit.getJobs();
      setJobs(data);
    } catch (err) {
      console.error('Failed to fetch audit jobs:', err);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Poll for job status updates while any job is RUNNING
  useEffect(() => {
    const interval = setInterval(() => {
      if (jobs.some((j) => j.status === 'RUNNING')) {
        fetchJobs();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [jobs, fetchJobs]);

  const handleSelectAll = () => {
    const pageIds = results.slice(0, ITEMS_PER_PAGE).map((r) => r.questionId);
    if (selectedIds.size === pageIds.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(pageIds));
    }
  };

  const handleSelectAllAcrossPages = () => {
    const allQuestionIds = results.map((r) => r.questionId);
    if (selectedIds.size === allQuestionIds.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(allQuestionIds));
    }
  };

  const handleSelect = (questionId: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(questionId)) {
      newSelected.delete(questionId);
    } else {
      newSelected.add(questionId);
    }
    setSelectedIds(newSelected);
  };

  const handleApplyFix = async (questionId: string) => {
    try {
      await audit.applyFix(questionId, 'admin');
      fetchResults();
      fetchStats();
    } catch (err) {
      console.error('Failed to apply fix:', err);
    }
  };

  const handleReject = async (questionId: string) => {
    try {
      await audit.reject(questionId, 'Rejected via audit dashboard');
      fetchResults();
      fetchStats();
    } catch (err) {
      console.error('Failed to reject:', err);
    }
  };

  const handleBulkApplyFixes = async () => {
    if (selectedIds.size === 0) return;
    try {
      await audit.bulkApplyFixes(Array.from(selectedIds), 'admin');
      fetchResults();
      fetchStats();
    } catch (err) {
      console.error('Failed to bulk apply fixes:', err);
    }
  };

  const handleBulkReject = async () => {
    if (selectedIds.size === 0) return;
    try {
      await audit.bulkReject(Array.from(selectedIds), 'Bulk rejected via audit');
      fetchResults();
      fetchStats();
    } catch (err) {
      console.error('Failed to bulk reject:', err);
    }
  };

  const startAudit = async () => {
    if (!runClass) return;
    try {
      await audit.runAudit(runClass);
      await fetchJobs();
      setShowRunModal(false);
    } catch (err) {
      console.error('Failed to start audit:', err);
    }
  };

  const paginatedResults = results.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ok':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
            OK
          </span>
        );
      case 'needs_fix':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
            Needs Fix
          </span>
        );
      case 'error':
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">
            Error
          </span>
        );
      default:
        return (
          <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="container mx-auto p-6 md:p-8">
      <div className="flex items-end justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">Audit Dashboard</h1>
          <p className="text-on-surface-variant mt-1">
            Review audit results and apply fixes to questions.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowRunModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-lg font-medium hover:opacity-90 transition shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Run Audit
          </button>
          <button
            onClick={() => {
              if (selectedIds.size === 0) return;
              handleBulkApplyFixes();
            }}
            disabled={selectedIds.size === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Apply Fix ({selectedIds.size})
          </button>
          <button
            onClick={() => {
              if (selectedIds.size === 0) return;
              handleBulkReject();
            }}
            disabled={selectedIds.size === 0}
            className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            Reject ({selectedIds.size})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-6">
        {CLASSES.slice(0, 6).map((cls) => {
          const classStats = classStatsMap[cls] || { total: 0, ok: 0, needsFix: 0, error: 0 };
          const totalQuestions = questionCounts[cls] || 0;
          const auditedPct = totalQuestions > 0 ? Math.round((classStats.total / totalQuestions) * 100) : 0;
          return (
            <button
              key={cls}
              onClick={() => setSelectedClass(selectedClass === cls ? null : cls)}
              className={`p-3 rounded-lg text-left transition ${
                selectedClass === cls
                  ? 'bg-primary/20 border-2 border-primary'
                  : 'bg-[var(--color-surface-container)] hover:bg-primary/10'
              }`}
            >
              <div className="text-xs text-on-surface-variant flex justify-between">
                <span>Class {cls}</span>
                <span className="text-blue-600">{auditedPct}%</span>
              </div>
              <div className="text-xl font-bold">{classStats.total} <span className="text-xs font-normal text-gray-400">/ {totalQuestions}</span></div>
              <div className="flex gap-2 mt-1 text-xs">
                <span className="text-green-600">{classStats.ok}</span>
                <span className="text-orange-600">{classStats.needsFix}</span>
                <span className="text-red-600">{classStats.error}</span>
              </div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-[var(--color-surface-container)] rounded-lg p-4">
          <div className="text-sm text-on-surface-variant">Total</div>
          <div className="text-2xl font-bold">{stats?.total || 0}</div>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
          <div className="text-sm text-green-700 dark:text-green-400">OK</div>
          <div className="text-2xl font-bold text-green-700 dark:text-green-400">
            {stats?.ok || 0}
          </div>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4">
          <div className="text-sm text-orange-700 dark:text-orange-400">Needs Fix</div>
          <div className="text-2xl font-bold text-orange-700 dark:text-orange-400">
            {stats?.needsFix || 0}
          </div>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4">
          <div className="text-sm text-red-700 dark:text-red-400">Errors</div>
          <div className="text-2xl font-bold text-red-700 dark:text-red-400">
            {stats?.error || 0}
          </div>
        </div>
      </div>

      <div className="bg-[var(--color-surface-container)] rounded-lg p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-sm font-medium text-on-surface-variant mb-1">
              Class
            </label>
            <select
              value={selectedClass || ''}
              onChange={(e) =>
                setSelectedClass(e.target.value ? Number(e.target.value) : null)
              }
              className="px-3 py-2 rounded-lg border border-[var(--color-outline)] bg-[var(--color-surface)] text-on-surface"
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
              Status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 rounded-lg border border-[var(--color-outline)] bg-[var(--color-surface)] text-on-surface"
            >
              <option value="">All Statuses</option>
              <option value="ok">OK</option>
              <option value="needs_fix">Needs Fix</option>
              <option value="error">Error</option>
            </select>
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={fetchResults}
              className="px-4 py-2 bg-primary text-primary-on rounded-lg font-medium hover:opacity-90 transition"
            >
              Apply Filters
            </button>
          </div>
        </div>
      </div>

      {selectedIds.size > 0 && (
        <div className="bg-[var(--color-primary-container)]/30 rounded-lg p-3 mb-4 flex flex-wrap items-center gap-3">
          <span className="text-sm font-medium">
            {selectedIds.size} selected
          </span>
          <button
            onClick={handleBulkApplyFixes}
            disabled={loading}
            className="px-3 py-1.5 bg-green-600 text-white text-sm rounded-lg font-medium hover:bg-green-700 transition disabled:opacity-50"
          >
            Apply Fixes
          </button>
          <button
            onClick={handleBulkReject}
            disabled={loading}
            className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg font-medium hover:bg-red-700 transition disabled:opacity-50"
          >
            Reject Questions
          </button>
        </div>
      )}

      <div className="bg-[var(--color-surface-container)] rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[var(--color-surface-container-high)]">
              <tr>
                <th className="px-4 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedIds.size === Math.min(ITEMS_PER_PAGE, results.length)
                    }
                    onChange={handleSelectAll}
                    className="w-4 h-4"
                  />
                  <button
                    onClick={handleSelectAllAcrossPages}
                    className="ml-2 text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    {selectedIds.size === results.length ? 'Deselect All' : 'Select All'}
                  </button>
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-on-surface-variant">
                  Class
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-on-surface-variant">
                  Question
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-on-surface-variant">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-sm font-medium text-on-surface-variant">
                  Issues
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
              ) : paginatedResults.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-on-surface-variant">
                    No audit results found.
                  </td>
                </tr>
              ) : (
                paginatedResults.map((result) => (
                  <tr
                    key={result.questionId}
                    className="hover:bg-[var(--color-surface-container-high)]/50"
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(result.questionId)}
                        onChange={() => handleSelect(result.questionId)}
                        className="w-4 h-4"
                      />
                    </td>
                    <td className="px-4 py-3 text-sm">
                      Class {result.classLevel}
                    </td>
                    <td className="px-4 py-3 text-sm min-w-[300px] max-w-md" title={result.questionText || undefined}>
                      {result.questionText}
                    </td>
                    <td className="px-4 py-3">
                      {getStatusBadge(result.auditStatus)}
                    </td>
                    <td className="px-4 py-3 text-sm text-on-surface-variant min-w-md max-w-md">
                      {result.issues?.slice(0, 2).join(', ')}
                      {result.issues && result.issues.length > 2 && (
                        <span className="text-xs ml-1">
                          +{result.issues.length - 2} more
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-2">
                        {(result.auditStatus === 'needs_fix' || result.auditStatus === 'fixed') && (
                          <button
                            onClick={() => handleApplyFix(result.questionId)}
                            className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition"
                          >
                            Apply Fix
                          </button>
                        )}
                        {result.auditStatus !== 'ok' && result.auditStatus !== 'fixed' && (
                          <button
                            onClick={() => handleReject(result.questionId)}
                            className="px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition"
                          >
                            Reject
                          </button>
                        )}
</div>

{/* Audit Jobs Section - Show only latest job */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-on-surface">Latest Audit Job</h2>
          {jobs.length === 0 ? (
            <p className="text-on-surface-variant">No audit jobs found.</p>
          ) : (
            <table className="w-full">
              <thead className="bg-[var(--color-surface-container-high)]">
                <tr>
                  <th className="px-4 py-2">Class</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Started</th>
                  <th className="px-4 py-2">Completed</th>
                  <th className="px-4 py-2">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-outline_variant)]">
                {jobs.slice(0, 1).map((job) => (
                  <tr key={job.id}>
                    <td className="px-4 py-2 text-sm">{job.classLevel}</td>
                    <td className="px-4 py-2 text-sm">{job.status}</td>
                    <td className="px-4 py-2 text-sm">{job.startedAt?.slice(0, 19).replace('T', ' ')}</td>
                    <td className="px-4 py-2 text-sm">{job.completedAt ? job.completedAt.slice(0, 19).replace('T', ' ') : '-'}</td>
                    <td className="px-4 py-2">
                      {job.status === 'RUNNING' && (
                        <button
                          onClick={async () => {
                            await audit.cancelJob(job.id!);
                            fetchJobs();
                          }}
                          className="px-2 py-1 text-xs bg-yellow-600 text-white rounded hover:bg-yellow-700"
                        >
                          Cancel
                        </button>
                      )}
                      {job.status === 'FAILED' && (job.stderr || job.stdout) && (
                        <details className="mt-1">
                          <summary className="text-xs text-primary cursor-pointer">View logs</summary>
                          <pre className="mt-1 text-xs whitespace-pre-wrap bg-gray-100 p-2 rounded">
                            {job.stderr ? job.stderr : job.stdout}
                          </pre>
                        </details>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

{showRunModal && (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
    <div className="bg-[var(--color-surface-container)] rounded-lg p-6 w-96">
      <h3 className="text-lg font-semibold mb-4 text-on-surface">Start Audit</h3>
      <label className="block mb-2 text-sm font-medium text-on-surface-variant">
        Class
      </label>
      <select
        value={runClass || ''}
        onChange={(e) => setRunClass(Number(e.target.value))}
        className="w-full mb-4 px-3 py-2 rounded-lg border border-[var(--color-outline)] bg-[var(--color-surface)] text-on-surface"
      >
        <option value="">Select class</option>
        {CLASSES.map((c) => (
          <option key={c} value={c}>
            Class {c}
          </option>
        ))}
      </select>
      <div className="flex justify-end gap-2">
        <button
          onClick={() => setShowRunModal(false)}
          className="px-3 py-1 rounded bg-gray-200 text-gray-800"
        >
          Cancel
        </button>
        <button
          onClick={startAudit}
          className="px-3 py-1 rounded bg-primary text-primary-on"
        >
          Start
        </button>
      </div>
    </div>
  </div>
)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-4 py-3 border-t border-[var(--color-outline_variant)] flex items-center justify-between">
            <div className="text-sm text-on-surface-variant">
              Showing {(currentPage - 1) * ITEMS_PER_PAGE + 1} to{' '}
              {Math.min(currentPage * ITEMS_PER_PAGE, totalCount)} of {totalCount} results
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1.5 text-sm rounded-lg border border-[var(--color-outline)] disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1.5 text-sm rounded-lg border border-[var(--color-outline)] disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}