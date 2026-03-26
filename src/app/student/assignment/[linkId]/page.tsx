import { notFound } from "next/navigation";
import StudentAssignmentForm from "@/components/StudentAssignmentForm";
import { api } from "@/lib/api";

interface StudentAssignmentPageProps {
  params: Promise<{
    linkId: string;
  }>;
}

export default async function StudentAssignmentPage({ params }: StudentAssignmentPageProps) {
  const resolvedParams = await params;
  
  if (!resolvedParams.linkId) {
    notFound();
  }

  try {
    const assignment = await api.assignments.getByLinkId(resolvedParams.linkId);
    
    if (!assignment) {
      notFound();
    }
    
    return (
      <main className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="bg-blue-600 p-6 sm:p-8 text-white relative overflow-hidden">
              <div className="relative z-10">
                <span className="inline-block px-3 py-1 bg-blue-500 rounded-full text-sm font-medium mb-4">
                  Student Assignment
                </span>
                <h1 className="text-2xl sm:text-3xl font-bold mb-2">{assignment.title}</h1>
                <div className="text-blue-100 flex flex-wrap gap-4 text-sm mt-4">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Due: {new Date(assignment.dueDate).toLocaleDateString()}
                  </div>
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                    {assignment.totalMarks} Marks
                  </div>
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

