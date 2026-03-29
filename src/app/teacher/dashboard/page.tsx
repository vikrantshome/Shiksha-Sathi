import { api } from "@/lib/api";
import Link from "next/link";
import { redirect } from "next/navigation";
import { 
  PlusIcon, 
  DocumentTextIcon, 
  UserGroupIcon, 
  ChartBarIcon,
  ChevronRightIcon
} from "@heroicons/react/24/outline";

export const dynamic = "force-dynamic";

export default async function TeacherDashboard() {
  let user;
  try {
    user = await api.auth.getMe();
  } catch (error) {
    redirect("/login");
  }

  let assignments: any[] = [];
  try {
    assignments = await api.assignments.getStats(user.id);
  } catch (error) {
    console.error("Failed to load assignments", error);
  }

  const totalSubmissions = assignments.reduce(
    (acc: number, a: any) => acc + a.submissionCount,
    0
  );

  const activeAssignments = assignments.filter((a: any) => a.submissionCount > 0).length;

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-6 mb-10">
        <div>
          <p className="text-label-md text-primary mb-2 uppercase tracking-widest">
            Welcome back
          </p>
          <h1 className="text-display-sm font-bold text-on-surface">{user.name || "Teacher"}</h1>
        </div>
        <Link 
          href="/teacher/question-bank" 
          className="btn-primary inline-flex items-center gap-2"
        >
          <PlusIcon className="w-5 h-5" />
          Create New Assignment
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <div className="card-static flex items-center gap-5 p-6 border border-outline-variant/30 shadow-sm rounded-xl">
          <div className="p-3 bg-primary-container text-on-primary-container rounded-lg">
            <DocumentTextIcon className="w-7 h-7" />
          </div>
          <div>
            <p className="text-label-sm text-on-surface-variant mb-1">
              Total Assignments
            </p>
            <p className="text-display-sm tracking-tight font-semibold text-on-surface">
              {assignments.length}
            </p>
          </div>
        </div>

        <div className="card-static flex items-center gap-5 p-6 border border-outline-variant/30 shadow-sm rounded-xl">
          <div className="p-3 bg-success-container text-success rounded-lg">
            <UserGroupIcon className="w-7 h-7" />
          </div>
          <div>
            <p className="text-label-sm text-on-surface-variant mb-1">
              Total Submissions
            </p>
            <p className="text-display-sm tracking-tight font-semibold text-on-surface">
              {totalSubmissions}
            </p>
          </div>
        </div>

        <div className="card-static sm:col-span-2 lg:col-span-1 flex items-center gap-5 p-6 border border-outline-variant/30 shadow-sm rounded-xl">
          <div className="p-3 bg-warning-container text-warning rounded-lg">
            <ChartBarIcon className="w-7 h-7" />
          </div>
          <div>
            <p className="text-label-sm text-on-surface-variant mb-1">
              Active Assignments
            </p>
            <p className="text-display-sm tracking-tight font-semibold text-on-surface">
              {activeAssignments}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Assignments */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-headline-md font-semibold text-on-surface">
          Recent Assignments
        </h2>
        {assignments.length > 0 && (
          <Link href="/teacher/assignments" className="text-body-sm text-primary hover:text-primary-dim transition-colors hidden sm:inline-block">
            View all
          </Link>
        )}
      </div>

      {assignments.length === 0 ? (
        <div className="text-center p-16 bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant/60 shadow-sm">
          <div className="mx-auto w-12 h-12 bg-surface-container rounded-full flex items-center justify-center mb-4">
            <DocumentTextIcon className="w-6 h-6 text-on-surface-variant" />
          </div>
          <h3 className="text-headline-sm font-medium text-on-surface mb-2">No assignments yet</h3>
          <p className="text-body-md text-on-surface-variant mb-6 max-w-sm mx-auto">
            You haven&apos;t created any assignments yet. Start by browsing the Question Bank to create your first one.
          </p>
          <Link href="/teacher/question-bank" className="btn-primary inline-flex items-center gap-2">
            Browse Question Bank
            <ChevronRightIcon className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/40 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="bg-surface-container/50 border-b border-outline-variant/40 text-label-sm text-on-surface-variant">
                <tr>
                  <th className="py-4 px-6 text-left font-medium">Assignment</th>
                  <th className="py-4 px-6 text-left font-medium">Class</th>
                  <th className="py-4 px-6 text-left font-medium">Submissions</th>
                  <th className="py-4 px-6 text-left font-medium">Avg Score</th>
                  <th className="py-4 px-6 text-right font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/30">
                {assignments.map((assignment: any) => (
                  <tr
                    key={assignment.id}
                    className="transition-colors hover:bg-surface-container-high/50 group"
                  >
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="font-medium text-body-md text-on-surface">
                        {assignment.title}
                      </div>
                      <div className="text-label-md text-on-surface-variant mt-1 font-mono tracking-wider" title={`Link: /student/assignment/${assignment.linkId}`}>
                        ID: {assignment.linkId}
                      </div>
                    </td>
                    <td className="text-body-sm py-4 px-6 whitespace-nowrap text-on-surface-variant">
                      <span className="badge bg-surface-container-high text-on-surface font-medium border border-outline-variant/20">
                        {assignment.className || 'Unassigned'}
                      </span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap font-medium text-body-sm text-on-surface">
                      {assignment.submissionCount}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap font-medium text-body-sm text-on-surface">
                      {assignment.averageScore} <span className="text-on-surface-variant font-normal">/ {assignment.maxScore}</span>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-right">
                      <Link
                        href={`/teacher/assignments/${assignment.id}`}
                        className="btn-ghost text-xs py-1.5 px-3 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap inline-flex items-center gap-1.5 border border-transparent hover:border-primary-container hover:bg-primary-container/20 hover:text-primary-dim"
                      >
                        View Report
                        <ChevronRightIcon className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
