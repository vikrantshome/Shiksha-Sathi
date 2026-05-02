"use client";

import { api } from "@/lib/api";
import { AssignmentReport, AssignmentSubmission, QuestionFeedback } from "@/lib/api/types";
import CopyAssignmentLinkButton from "@/components/CopyAssignmentLinkButton";
import StudentDetailPanel from "@/components/StudentDetailPanel";
import { notFound } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, use, useMemo } from "react";
import DataGrid from "@/components/DataGrid";
import { 
  ArrowLeftIcon, 
  ClipboardDocumentCheckIcon, 
  ChartBarIcon, 
  TableCellsIcon,
  ChartPieIcon
} from "@heroicons/react/24/outline";

export default function AssignmentReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const [report, setReport] = useState<AssignmentReport | null>(null);
  const [viewMode, setViewMode] = useState<'report' | 'worksheet'>('report');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [regradingSubmission, setRegradingSubmission] = useState(false);

  useEffect(() => {
    api.assignments.getReport(resolvedParams.id)
      .then(data => setReport(data))
      .catch(() => setReport(null))
      .finally(() => setIsLoading(false));
  }, [resolvedParams.id]);

  const handleGradeUpdate = async (studentId: string, questionId: string, value: unknown) => {
    if (!report) return;
    const score = parseInt(value as string, 10);
    if (isNaN(score)) return;

    try {
      await api.assignments.updateGrade(report.assignment.id, { studentId, questionId, score });
      // Refresh report data to show updated totals
      const updated = await api.assignments.getReport(report.assignment.id);
      setReport(updated);
    } catch (err) {
      console.error("Failed to update grade", err);
    }
  };

  const handleRegrade = async (submissionId: string) => {
    setRegradingSubmission(true);
    try {
      await api.assignments.regradeSubmission(submissionId);
      const updated = await api.assignments.getReport(resolvedParams.id);
      setReport(updated);
    } catch (err) {
      console.error("Failed to re-grade", err);
    } finally {
      setRegradingSubmission(false);
    }
  };

  const { worksheetColumns, worksheetData } = useMemo(() => {
    if (!report) return { worksheetColumns: [], worksheetData: [] };

    const { assignment, submissions, questionStats } = report;

    const columns = [
      { key: 'student', header: 'Student', width: '200px' },
      ...questionStats.map((q, i) => ({ 
        key: q.questionId, 
        header: `Q${i + 1}`, 
        editable: true, 
        width: '80px' 
      })),
      { key: 'total', header: 'Total Score', width: '120px' }
    ];

    const data = submissions.map(sub => {
      const row: Record<string, unknown> = { id: sub.studentId, student: sub.studentName, total: `${sub.score} / ${assignment.totalMarks}` };
      // Map scores from the feedback array added in the backend PR
      if (sub.feedback) {
        sub.feedback.forEach((f: QuestionFeedback) => {
          row[f.questionId] = f.marksAwarded;
        });
      }
      return row;
    });

    return { worksheetColumns: columns, worksheetData: data };
  }, [report]);

  if (isLoading) return (
    <div className="p-12 text-center text-[var(--color-on-surface-variant)] font-medium">
      Loading assignment data...
    </div>
  );
  if (!report) return notFound();

  const { assignment, submissions, questionStats } = report;
  const selectedStudent = selectedStudentId 
    ? submissions.find(s => s.studentId === selectedStudentId)
    : null;
  const host = typeof window !== 'undefined' ? window.location.host : '';
  const protocol = typeof window !== 'undefined' ? window.location.protocol : 'https:';
  const path = `/student/assignment/${assignment.linkId}`;
  const shareLink = `${protocol}//${host}${path}`;

  const averageScore =
    submissions.length > 0
      ? submissions.reduce((acc: number, sub: AssignmentSubmission) => acc + sub.score, 0) /
        submissions.length
      : 0;

  return (
    <div className="max-w-7xl mx-auto pb-8 md:pb-12 px-4">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <Link
              href="/teacher/assignments"
              className="text-[var(--color-on-surface-variant)] text-xs font-bold uppercase tracking-wider no-underline hover:text-[var(--color-primary-dim)] flex items-center gap-1.5 mb-4 transition-colors"
            >
              <ArrowLeftIcon className="w-3 h-3" /> Back to Assignments
            </Link>
            <h1 className="text-2xl md:text-3xl font-semibold text-[var(--color-on-surface)] m-0 tracking-tight">
              {assignment.title}
            </h1>
            <div className="mt-2">
              <CopyAssignmentLinkButton shareLink={shareLink} path={path} code={assignment.code} />
            </div>
          </div>

          <div className="bg-[var(--color-surface-container-low)] p-1 rounded-sm flex gap-1 self-start">
            <button 
              onClick={() => setViewMode('report')}
              className={`px-5 py-2 rounded-sm text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${viewMode === 'report' ? 'bg-[var(--color-primary-dim)] text-[var(--color-on-primary)]' : 'text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]'}`}
            >
              <ChartPieIcon className="w-4 h-4" /> Report View
            </button>
            <button 
              onClick={() => setViewMode('worksheet')}
              className={`px-5 py-2 rounded-sm text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${viewMode === 'worksheet' ? 'bg-[var(--color-primary-dim)] text-[var(--color-on-primary)]' : 'text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]'}`}
            >
              <TableCellsIcon className="w-4 h-4" /> Grading Worksheet
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'report' ? (
        <div className="space-y-8">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-[var(--color-surface-container-low)] p-6 rounded-md flex items-center gap-5">
              <div className="w-12 h-12 rounded-full bg-[var(--color-primary-dim)] text-[var(--color-on-primary)] flex items-center justify-center">
                <ClipboardDocumentCheckIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[0.6875rem] font-medium uppercase tracking-widest text-[var(--color-on-surface-variant)] mb-1">Submissions</p>
                <p className="text-3xl font-semibold text-[var(--color-on-surface)] m-0">{submissions.length}</p>
              </div>
            </div>

            <div className="bg-[var(--color-surface-container-low)] p-6 rounded-md flex items-center gap-5">
              <div className="w-12 h-12 rounded-full bg-[var(--color-surface-container)] text-[var(--color-primary-dim)] flex items-center justify-center">
                <ChartBarIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[0.6875rem] font-medium uppercase tracking-widest text-[var(--color-on-surface-variant)] mb-1">Avg Score</p>
                <p className="text-3xl font-semibold text-[var(--color-on-surface)] m-0">
                  {averageScore.toFixed(1)}
                  <span className="text-sm font-medium text-[var(--color-on-surface-variant)] ml-2">/ {assignment.totalMarks}</span>
                </p>
              </div>
            </div>
          </div>

          {/* Main workspace: sidebar + content */}
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Student sidebar - fixed width on desktop */}
            <aside className="w-full lg:w-80 flex-shrink-0">
              <div className="bg-[var(--color-surface-container-lowest)] rounded-md overflow-hidden">
                <div className="px-5 py-3 bg-[var(--color-surface-container-low)] flex items-center justify-between">
                  <h2 className="text-sm font-semibold tracking-tight text-[var(--color-on-surface)] m-0">Student Results</h2>
                  <span className="text-[0.6875rem] font-medium text-[var(--color-on-surface-variant)] bg-[var(--color-surface-container-lowest)] px-2 py-0.5 rounded-sm">
                    {submissions.length} Total
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[var(--color-surface-container)]">
                      <tr>
                        <th className="text-[0.6875rem] font-medium uppercase tracking-wider text-[var(--color-on-surface-variant)] py-2.5 px-5 text-left">Student</th>
                        <th className="text-[0.6875rem] font-medium uppercase tracking-wider text-[var(--color-on-surface-variant)] py-2.5 px-5 text-left">Roll No</th>
                        <th className="text-[0.6875rem] font-medium uppercase tracking-wider text-[var(--color-on-surface-variant)] py-2.5 px-5 text-right">Score</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-outline-variant)]/10">
                      {submissions.map((sub) => (
                        <tr 
                          key={sub.id} 
                          className="hover:bg-[var(--color-surface-container-high)] transition-colors cursor-pointer"
                          onClick={() => setSelectedStudentId(sub.studentId)}
                        >
                          <td className="py-3 px-5 font-medium text-[var(--color-on-surface)] text-sm">{sub.studentName}</td>
                          <td className="py-3 px-5 text-[var(--color-on-surface-variant)] text-xs font-mono">{sub.studentRollNumber}</td>
                          <td className="py-3 px-5 text-right">
                             <span className="font-semibold text-[var(--color-on-surface)] text-sm">{sub.score}</span>
                             <span className="text-xs text-[var(--color-on-surface-variant)] font-medium"> / {assignment.totalMarks}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </aside>
            
            {/* Main content area — Question Insights or Student Detail */}
            <main className="flex-1 min-w-0">
              {selectedStudent ? (
                <StudentDetailPanel 
                  student={selectedStudent}
                  assignment={assignment}
                  onClose={() => setSelectedStudentId(null)}
                  onGradeUpdate={handleGradeUpdate}
                  onRegrade={handleRegrade}
                  regrading={regradingSubmission}
                />
              ) : (
                <div className="bg-[var(--color-surface-container-lowest)] rounded-md overflow-hidden">
                  <div className="px-5 py-3 bg-[var(--color-surface-container-low)]">
                    <h2 className="text-sm font-semibold tracking-tight text-[var(--color-on-surface)] m-0">Question Insights</h2>
                  </div>
                  <div className="p-5 flex flex-col gap-5">
                    {questionStats.map((q, i) => {
                      let statusColor = "bg-[var(--color-error)]";
                      if (q.correctPercentage >= 70) statusColor = "bg-[var(--color-success)]";
                      else if (q.correctPercentage >= 40) statusColor = "bg-[var(--color-warning)]";

                      return (
                        <div key={q.questionId} className="group">
                          <div className="flex justify-between items-start mb-2">
                            <span className="text-sm font-medium text-[var(--color-on-surface)] leading-tight">
                              <span className="text-[var(--color-on-surface-variant)] opacity-60 mr-1">Q{i + 1}.</span> {q.topic}
                            </span>
                            <span className={`text-[0.6875rem] font-medium uppercase tracking-wider px-2 py-0.5 rounded-sm ${q.correctPercentage >= 70 ? 'text-[var(--color-success)] bg-[var(--color-success-container)]/30' : 'text-[var(--color-error)] bg-[var(--color-error-container)]/30'}`}>
                              {q.correctPercentage}% Correct
                            </span>
                          </div>
                          <p className="text-xs text-[var(--color-on-surface-variant)] mb-3 line-clamp-2">{q.text}</p>
                          <div className="w-full h-1.5 bg-[var(--color-surface-container)] rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-700 ${statusColor}`} style={{ width: `${q.correctPercentage}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </main>
          </div>
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="bg-[var(--color-surface-container-low)] p-4 rounded-md flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--color-primary-dim)] text-[var(--color-on-primary)] flex items-center justify-center">
                <TableCellsIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[0.6875rem] font-medium uppercase tracking-wider text-[var(--color-on-surface-variant)] m-0">Grading Matrix</p>
                <p className="text-sm font-semibold text-[var(--color-on-surface)] m-0">Cell-Level Grade Overrides</p>
              </div>
            </div>

            <DataGrid 
              columns={worksheetColumns}
              data={worksheetData}
              rowKey="id"
              onCellChange={handleGradeUpdate}
              getCellClassName={(rowId, colKey) => {
                const sub = submissions.find(s => s.studentId === rowId);
                const qFeedback = sub?.feedback?.find(f => f.questionId === colKey);
                if (qFeedback?.aiGradingFailed) return "bg-red-50";
                return undefined;
              }}
            />

            <div className="bg-[var(--color-surface-container-low)]/50 p-4 rounded-md flex items-start gap-3">
              <div className="mt-0.5 text-[var(--color-primary-dim)]">💡</div>
              <p className="text-xs text-[var(--color-on-surface-variant)] leading-relaxed m-0">
                <span className="font-semibold text-[var(--color-on-surface)]">Manual Grading:</span> Clicking into a question cell (Q1, Q2...) allows you to override the AI&apos;s calculation. The total score for the student will automatically update upon saving.
              </p>
            </div>
        </div>
      )}
    </div>
  );
}
