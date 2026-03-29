import { notFound } from "next/navigation";
import StudentAssignmentForm from "@/components/StudentAssignmentForm";
import { api } from "@/lib/api";
import {
  ClockIcon,
  ClipboardDocumentListIcon,
} from "@heroicons/react/24/outline";

export const dynamic = "force-dynamic";

interface StudentAssignmentPageProps {
  params: Promise<{
    linkId: string;
  }>;
}

export default async function StudentAssignmentPage({
  params,
}: StudentAssignmentPageProps) {
  const resolvedParams = await params;

  if (!resolvedParams.linkId) {
    notFound();
  }

  try {
    const assignment = await api.assignments.getByLinkId(
      resolvedParams.linkId
    );

    if (!assignment) {
      notFound();
    }

    return (
      <main className="min-h-screen bg-surface p-4 sm:p-6 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-surface-container-lowest rounded-md overflow-hidden">
            {/* Header */}
            <div className="bg-primary px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-8 text-on-primary relative">
              <span className="badge inline-flex mb-3 bg-white/15 text-on-primary border-0">
                Student Assignment
              </span>
              <h1 className="text-display-sm text-on-primary">
                {assignment.title}
              </h1>
              <div className="flex flex-wrap gap-4 sm:gap-5 mt-4 text-[0.8125rem] opacity-85">
                <div className="flex items-center gap-1.5">
                  <ClockIcon className="w-4 h-4" />
                  Due:{" "}
                  {new Date(assignment.dueDate).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-1.5">
                  <ClipboardDocumentListIcon className="w-4 h-4" />
                  {assignment.totalMarks} Marks
                </div>
              </div>
            </div>

            <StudentAssignmentForm assignment={assignment} />
          </div>
        </div>
      </main>
    );
  } catch (error) {
    notFound();
  }
}
