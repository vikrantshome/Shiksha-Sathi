import { api } from "@/lib/api";
import { AssignmentReport, AssignmentSubmission } from "@/lib/api/types";
import CopyAssignmentLinkButton from "@/components/CopyAssignmentLinkButton";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeftIcon, 
  ClipboardDocumentCheckIcon, 
  ChartBarIcon, 
} from "@heroicons/react/24/outline";

export const dynamic = "force-dynamic";

export default async function AssignmentReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  let report: AssignmentReport | null = null;
  try {
    report = await api.assignments.getReport(resolvedParams.id);
  } catch {
    notFound();
  }

  if (!report) {
    notFound();
  }

  const { assignment, submissions, questionStats } = report;
  const requestHeaders = await headers();
  const host = requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "";
  const protocol = requestHeaders.get("x-forwarded-proto") ?? "https";
  const path = `/student/assignment/${assignment.linkId}`;
  const shareLink = host ? `${protocol}://${host}${path}` : path;

  const averageScore =
    submissions.length > 0
      ? submissions.reduce((acc: number, sub: AssignmentSubmission) => acc + sub.score, 0) /
        submissions.length
      : 0;

  return (
    <div className="max-w-6xl mx-auto pb-8 md:pb-12">
      {/* Header */}
      <div className="mb-6 md:mb-10">
        <Link
          href="/teacher/dashboard"
          className="btn-ghost text-xs py-1.5 px-3 mb-4 md:mb-6 inline-flex items-center gap-1.5"
        >
          <ArrowLeftIcon className="w-3.5 h-3.5" />
          Back to Dashboard
        </Link>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 md:gap-6">
          <div className="flex-1">
            <h1 className="font-manrope text-display-sm font-bold text-on-surface mb-2">{assignment.title}</h1>
            <CopyAssignmentLinkButton shareLink={shareLink} path={path} code={assignment.code} />
          </div>
          <div className="sm:text-right bg-surface-container-lowest border border-outline-variant/30 rounded-lg px-4 py-2.5 md:px-5 md:py-3 shadow-sm">
            <span className="text-label-sm text-on-surface-variant uppercase tracking-wider block mb-1">
              Total Marks
            </span>
            <span className="text-display-sm tracking-tight font-semibold text-primary">
              {assignment.totalMarks}
            </span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-3 md:gap-6 mb-6 md:mb-10">
        <div className="card-static flex items-center gap-3 md:gap-5 p-4 md:p-6 border border-outline-variant/30 shadow-sm rounded-lg">
          <div className="p-2 md:p-3 bg-primary-container text-on-primary-container rounded-lg shrink-0">
            <ClipboardDocumentCheckIcon className="w-5 h-5 md:w-7 md:h-7" />
          </div>
          <div>
            <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-0.5 md:mb-1">
              Submissions
            </p>
            <p className="text-display-sm tracking-tight font-semibold text-on-surface">
              {submissions.length}
            </p>
          </div>
        </div>

        <div className="card-static flex items-center gap-3 md:gap-5 p-4 md:p-6 border border-outline-variant/30 shadow-sm rounded-lg">
          <div className="p-2 md:p-3 bg-secondary-container text-on-surface rounded-lg shrink-0">
            <ChartBarIcon className="w-5 h-5 md:w-7 md:h-7" />
          </div>
          <div>
            <p className="text-label-sm text-on-surface-variant uppercase tracking-wider mb-0.5 md:mb-1">
              Avg Score
            </p>
            <p className="text-display-sm tracking-tight font-semibold">
              <span className="text-primary">{averageScore.toFixed(1)}</span>
              <span className="text-body-lg text-on-surface-variant ml-1.5 md:ml-2 font-normal">
                / {assignment.totalMarks}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 lg:gap-8">
        {/* Student Submissions */}
        <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/30 shadow-sm overflow-hidden flex flex-col">
          <div className="px-4 md:px-6 py-3 md:py-4 bg-surface-container/40 border-b border-outline-variant/30">
            <h2 className="text-headline-sm font-semibold text-on-surface">Student Results</h2>
          </div>
          {submissions.length === 0 ? (
            <div className="p-8 md:p-12 text-center flex-1 flex flex-col items-center justify-center">
              <ClipboardDocumentCheckIcon className="w-8 h-8 md:w-10 md:h-10 text-outline-variant mb-3 opacity-50" />
              <p className="text-body-md text-on-surface-variant">
                No submissions yet.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto flex-1">
              <table className="w-full border-collapse">
                <thead className="bg-surface-container/20">
                  <tr>
                    <th className="text-label-sm uppercase tracking-wider text-on-surface-variant py-2.5 px-4 md:py-3 md:px-6 text-left font-medium border-b border-outline-variant/30">
                      Student
                    </th>
                    <th className="text-label-sm uppercase tracking-wider text-on-surface-variant py-2.5 px-4 md:py-3 md:px-6 text-left font-medium border-b border-outline-variant/30">
                      Roll No
                    </th>
                    <th className="text-label-sm uppercase tracking-wider text-on-surface-variant py-2.5 px-4 md:py-3 md:px-6 text-right font-medium border-b border-outline-variant/30">
                      Score
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/20">
                  {submissions.map((sub: AssignmentSubmission) => (
                    <tr
                      key={sub.id}
                      className="transition-colors hover:bg-surface-container/40"
                    >
                      <td className="py-2.5 px-4 md:py-3.5 md:px-6 whitespace-nowrap font-medium text-body-md text-on-surface">
                        {sub.studentName}
                      </td>
                      <td className="text-body-sm py-2.5 px-4 md:py-3.5 md:px-6 whitespace-nowrap text-on-surface-variant font-mono">
                        {sub.studentRollNumber}
                      </td>
                      <td className="py-2.5 px-4 md:py-3.5 md:px-6 whitespace-nowrap text-right font-semibold text-primary text-body-md">
                        {sub.score} <span className="text-on-surface-variant font-normal text-sm">/ {assignment.totalMarks}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Question Performance */}
        <div className="bg-surface-container-lowest rounded-lg border border-outline-variant/30 shadow-sm overflow-hidden h-fit">
          <div className="px-4 md:px-6 py-3 md:py-4 bg-surface-container/40 border-b border-outline-variant/30">
            <h2 className="text-headline-sm font-semibold text-on-surface">Question Performance</h2>
          </div>
          <div className="p-4 md:p-6 flex flex-col gap-4 md:gap-6">
            {questionStats.map(
              (
                q: {
                  questionId: string;
                  text: string;
                  topic: string;
                  marks: number;
                  correctPercentage: number;
                },
                i: number
              ) => {
                let statusColor = "bg-error text-on-primary";
                let badgeClass = "bg-error-container/80 text-error border border-error/20";
                
                if (q.correctPercentage >= 70) {
                  statusColor = "bg-success text-on-primary";
                  badgeClass = "bg-success-container/80 text-success border border-success/20";
                } else if (q.correctPercentage >= 40) {
                  statusColor = "bg-warning text-on-primary";
                  badgeClass = "bg-warning-container/80 text-warning border border-warning/20";
                }

                return (
                  <div key={q.questionId} className="group">
                    <div className="flex justify-between items-start mb-2 gap-4">
                      <span className="text-body-md font-medium text-on-surface leading-tight">
                        <span className="text-on-surface-variant opacity-70 mr-1">Q{i + 1}.</span> {q.topic}
                      </span>
                      <span className={`badge shrink-0 ${badgeClass}`}>
                        {q.correctPercentage}% Correct
                      </span>
                    </div>
                    
                    <p className="text-body-sm text-on-surface-variant mb-3 line-clamp-2 pr-4 group-hover:line-clamp-none transition-all">
                      {q.text}
                    </p>
                    
                    {/* Thin progress bar */}
                    <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ease-out w-[var(--bar-w)] ${statusColor}`}
                        style={{ '--bar-w': `${q.correctPercentage}%` } as React.CSSProperties}
                      ></div>
                    </div>
                  </div>
                );
              }
            )}
            
            {questionStats.length === 0 && (
              <div className="text-center py-8 text-on-surface-variant text-body-md">
                No question data available yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
