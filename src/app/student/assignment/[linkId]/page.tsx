import { getAssignmentByLinkId } from "@/app/actions/student";
import { notFound } from "next/navigation";
import StudentAssignmentForm from "@/components/StudentAssignmentForm";

export default async function StudentAssignmentPage({
  params,
}: {
  params: Promise<{ linkId: string }>;
}) {
  const resolvedParams = await params;
  const assignment = await getAssignmentByLinkId(resolvedParams.linkId);

  if (!assignment) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
          <div className="p-6 sm:p-8 border-b border-gray-200 bg-blue-600 text-white">
            <h1 className="text-2xl sm:text-3xl font-bold">{assignment.title}</h1>
            <div className="mt-2 text-blue-100 flex justify-between items-center text-sm font-medium">
              <span>Total Marks: {assignment.totalMarks}</span>
              {assignment.dueDate && <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>}
            </div>
          </div>
          
          <StudentAssignmentForm assignment={assignment} />
        </div>
      </div>
    </div>
  );
}
