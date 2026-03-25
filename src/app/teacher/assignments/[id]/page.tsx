import { getAssignmentReport } from "@/app/actions/teacher";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function AssignmentReportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const report = await getAssignmentReport(resolvedParams.id);

  if (!report) {
    notFound();
  }

  const { assignment, submissions, questionStats } = report;

  const averageScore = submissions.length > 0
    ? submissions.reduce((acc, sub) => acc + sub.score, 0) / submissions.length
    : 0;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link href="/teacher/dashboard" className="text-sm text-blue-600 hover:text-blue-800 mb-4 inline-block">
          &larr; Back to Dashboard
        </Link>
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{assignment.title}</h1>
            <p className="text-gray-500 mt-1">Student Link: <code>/student/assignment/{assignment.linkId}</code></p>
          </div>
          <div className="text-right">
            <span className="block text-sm text-gray-500 font-medium">Total Marks</span>
            <span className="text-2xl font-bold text-gray-900">{assignment.totalMarks}</span>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Total Submissions</h3>
          <p className="text-4xl font-bold text-gray-900">{submissions.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-sm font-medium text-gray-500 mb-1">Average Score</h3>
          <p className="text-4xl font-bold text-blue-600">
            {averageScore.toFixed(1)} <span className="text-xl text-gray-400">/ {assignment.totalMarks}</span>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Student Submissions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-bold text-gray-900">Student Results</h2>
          </div>
          {submissions.length === 0 ? (
            <div className="p-8 text-center text-gray-500">No submissions yet.</div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Student</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Roll No</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Score</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {sub.studentName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {sub.studentRollNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-bold text-blue-600">
                      {sub.score} / {sub.totalMarks}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Question Performance */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-fit">
          <div className="px-6 py-5 border-b border-gray-200 bg-gray-50">
            <h2 className="text-lg font-bold text-gray-900">Question Performance</h2>
          </div>
          <div className="p-6 space-y-6">
            {questionStats.map((q: { questionId: string; text: string; topic: string; marks: number; correctPercentage: number }, i: number) => (
              <div key={q.questionId}>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-medium text-gray-900">Q{i + 1}. {q.topic}</span>
                  <span className={`text-xs font-bold px-2 py-1 rounded ${q.correctPercentage >= 70 ? 'bg-green-100 text-green-700' : q.correctPercentage >= 40 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                    {q.correctPercentage}% Correct
                  </span>
                </div>
                <p className="text-sm text-gray-600 line-clamp-2">{q.text}</p>
                <div className="w-full bg-gray-200 rounded-full h-1.5 mt-3">
                  <div
                    className={`h-1.5 rounded-full ${q.correctPercentage >= 70 ? 'bg-green-500' : q.correctPercentage >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                    style={{ width: `${q.correctPercentage}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
