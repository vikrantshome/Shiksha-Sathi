"use client";

import { api } from "@/lib/api";
import { AssignmentReport, AssignmentSubmission, QuestionFeedbackDTO } from "@/lib/api/types";
import CopyAssignmentLinkButton from "@/components/CopyAssignmentLinkButton";
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

  useEffect(() => {
    api.assignments.getReport(resolvedParams.id)
      .then(data => setReport(data))
      .catch(() => setReport(null))
      .finally(() => setIsLoading(false));
  }, [resolvedParams.id]);

  const handleGradeUpdate = async (studentId: string, questionId: string, value: any) => {
    if (!report) return;
    const score = parseInt(value, 10);
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
      const row: any = { id: sub.studentId, student: sub.studentName, total: `${sub.score} / ${assignment.totalMarks}` };
      // Map scores from the feedback array added in the backend PR
      if (sub.feedback) {
        sub.feedback.forEach((f: QuestionFeedbackDTO) => {
          row[f.questionId] = f.marksAwarded;
        });
      }
      return row;
    });

    return { worksheetColumns: columns, worksheetData: data };
  }, [report]);

  if (isLoading) return <div className="p-12 text-center text-[#707977] font-medium">Loading assignment data...</div>;
  if (!report) return notFound();

  const { assignment, submissions, questionStats } = report;
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
              className="text-[#707977] text-xs font-bold uppercase tracking-wider no-underline hover:text-[#12423f] flex items-center gap-1.5 mb-4"
            >
              <ArrowLeftIcon className="w-3 h-3" /> Back to Assignments
            </Link>
            <h1 className="text-2xl md:text-3xl font-black text-[#12423f] m-0">{assignment.title}</h1>
            <div className="mt-2">
              <CopyAssignmentLinkButton shareLink={shareLink} path={path} code={assignment.code} />
            </div>
          </div>

          <div className="bg-[#f0ede9] p-1 rounded-xl flex gap-1 border border-[#c0c8c6]/30 shadow-sm self-start">
            <button 
              onClick={() => setViewMode('report')}
              className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${viewMode === 'report' ? 'bg-[#12423f] text-white shadow-md' : 'text-[#707977] hover:text-[#1c1c1a]'}`}
            >
              <ChartPieIcon className="w-4 h-4" /> Report View
            </button>
            <button 
              onClick={() => setViewMode('worksheet')}
              className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-all ${viewMode === 'worksheet' ? 'bg-[#12423f] text-white shadow-md' : 'text-[#707977] hover:text-[#1c1c1a]'}`}
            >
              <TableCellsIcon className="w-4 h-4" /> Grading Worksheet
            </button>
          </div>
        </div>
      </div>

      {viewMode === 'report' ? (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-8">
            <div className="bg-[#f0ede9] p-6 rounded-2xl border border-[#c0c8c6]/30 flex items-center gap-5">
              <div className="w-12 h-12 rounded-full bg-[#12423f] text-white flex items-center justify-center shadow-inner">
                <ClipboardDocumentCheckIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[0.65rem] font-bold uppercase tracking-widest text-[#707977] mb-1">Submissions</p>
                <p className="text-3xl font-black text-[#12423f] m-0">{submissions.length}</p>
              </div>
            </div>

            <div className="bg-[#f0ede9] p-6 rounded-2xl border border-[#c0c8c6]/30 flex items-center gap-5">
              <div className="w-12 h-12 rounded-full bg-[#12423f]/10 text-[#12423f] flex items-center justify-center shadow-inner">
                <ChartBarIcon className="w-6 h-6" />
              </div>
              <div>
                <p className="text-[0.65rem] font-bold uppercase tracking-widest text-[#707977] mb-1">Avg Score</p>
                <p className="text-3xl font-black text-[#12423f] m-0">
                  {averageScore.toFixed(1)}
                  <span className="text-sm font-bold text-[#707977] ml-2">/ {assignment.totalMarks}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
            {/* Student Submissions List */}
            <div className="bg-white rounded-2xl border border-[#c0c8c6]/30 shadow-sm overflow-hidden">
              <div className="px-6 py-4 bg-[#f0ede9] border-b border-[#c0c8c6]/30 flex items-center justify-between">
                <h2 className="text-sm font-black uppercase tracking-wider text-[#12423f] m-0">Student Results</h2>
                <span className="text-[0.65rem] font-bold text-[#707977] bg-white px-2 py-0.5 rounded-full border border-[#c0c8c6]/20">
                  {submissions.length} Total
                </span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead className="bg-[#f0ede9]/30">
                    <tr>
                      <th className="text-[0.6rem] font-black uppercase tracking-widest text-[#707977] py-3 px-6 text-left border-b border-[#c0c8c6]/10">Student</th>
                      <th className="text-[0.6rem] font-black uppercase tracking-widest text-[#707977] py-3 px-6 text-left border-b border-[#c0c8c6]/10">Roll No</th>
                      <th className="text-[0.6rem] font-black uppercase tracking-widest text-[#707977] py-3 px-6 text-right border-b border-[#c0c8c6]/10">Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#c0c8c6]/10">
                    {submissions.map((sub) => (
                      <tr key={sub.id} className="hover:bg-[#f6f3ef] transition-colors">
                        <td className="py-4 px-6 font-bold text-[#1c1c1a] text-sm">{sub.studentName}</td>
                        <td className="py-4 px-6 text-[#707977] text-xs font-mono">{sub.studentRollNumber}</td>
                        <td className="py-4 px-6 text-right">
                           <span className="font-black text-[#12423f] text-sm">{sub.score}</span>
                           <span className="text-xs text-[#707977] font-bold"> / {assignment.totalMarks}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Question Performance */}
            <div className="bg-white rounded-2xl border border-[#c0c8c6]/30 shadow-sm overflow-hidden">
               <div className="px-6 py-4 bg-[#f0ede9] border-b border-[#c0c8c6]/30">
                <h2 className="text-sm font-black uppercase tracking-wider text-[#12423f] m-0">Question Insights</h2>
              </div>
              <div className="p-6 flex flex-col gap-6">
                {questionStats.map((q, i) => {
                  let statusColor = "bg-error";
                  if (q.correctPercentage >= 70) statusColor = "bg-[#12423f]";
                  else if (q.correctPercentage >= 40) statusColor = "bg-warning";

                  return (
                    <div key={q.questionId} className="group">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-bold text-[#1c1c1a] leading-tight">
                          <span className="text-[#707977] opacity-60 mr-1">Q{i + 1}.</span> {q.topic}
                        </span>
                        <span className={`text-[0.6rem] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${q.correctPercentage >= 70 ? 'text-[#12423f] border-[#12423f]/20 bg-[#12423f]/5' : 'text-error border-error/20 bg-error/5'}`}>
                          {q.correctPercentage}% Correct
                        </span>
                      </div>
                      <p className="text-xs text-[#404847] mb-3 line-clamp-2">{q.text}</p>
                      <div className="w-full h-1.5 bg-[#f0ede9] rounded-full overflow-hidden">
                        <div className={`h-full rounded-full transition-all duration-700 ${statusColor}`} style={{ width: `${q.correctPercentage}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
           <div className="bg-[#f0ede9] p-4 rounded-2xl border border-[#c0c8c6]/30 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#12423f] text-white flex items-center justify-center">
                <TableCellsIcon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-[0.65rem] font-bold uppercase tracking-wider text-[#707977] m-0">Grading Matrix</p>
                <p className="text-sm font-bold text-[#12423f] m-0">Cell-Level Grade Overrides</p>
              </div>
            </div>

            <DataGrid 
              columns={worksheetColumns}
              data={worksheetData}
              rowKey="id"
              onCellChange={handleGradeUpdate}
            />

            <div className="bg-primary/5 border border-primary/10 p-4 rounded-xl flex items-start gap-3">
              <div className="mt-0.5 text-[#12423f]">💡</div>
              <p className="text-xs text-[#404847] leading-relaxed m-0">
                <span className="font-bold text-[#12423f]">Manual Grading:</span> Clicking into a question cell (Q1, Q2...) allows you to override the AI's calculation. The total score for the student will automatically update upon saving.
              </p>
            </div>
        </div>
      )}
    </div>
  );
}
