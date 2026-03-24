import { questionBank, QuestionType } from "@/lib/questions";
import QuestionBankFilters from "@/components/QuestionBankFilters";
import QuestionCard from "@/components/QuestionCard";

export default async function QuestionBankPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const subject = typeof resolvedParams.subject === 'string' ? resolvedParams.subject : null;
  const chapter = typeof resolvedParams.chapter === 'string' ? resolvedParams.chapter : null;
  const q = typeof resolvedParams.q === 'string' ? resolvedParams.q.toLowerCase() : null;
  const type = typeof resolvedParams.type === 'string' ? resolvedParams.type : "ALL";

  // Simulate server-side DB fetching and filtering
  const subjects = Array.from(new Set(questionBank.map(item => item.subject)));
  const chapters = subject 
    ? Array.from(new Set(questionBank.filter(item => item.subject === subject).map(item => item.chapter)))
    : [];

  let displayedQuestions = chapter
    ? questionBank.filter(item => item.subject === subject && item.chapter === chapter)
    : [];

  if (q) {
    displayedQuestions = displayedQuestions.filter(item => 
      item.text.toLowerCase().includes(q) || 
      item.topic.toLowerCase().includes(q)
    );
  }

  if (type && type !== "ALL") {
    displayedQuestions = displayedQuestions.filter(item => item.type === type);
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Question Bank</h1>
          <p className="text-gray-500">Browse, search, and preview questions for your assignments.</p>
        </div>
      </div>
      
      {/* Layout Grid containing Filters and Content */}
      <QuestionBankFilters subjects={subjects} chapters={chapters} />

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-6">
        {/* Empty col-span-1 to offset the sidebar from Filters */}
        <div className="hidden md:block md:col-span-1"></div>

        {/* Content Area */}
        <div className="md:col-span-3">
          {!subject ? (
            <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center border-dashed">
              <p className="text-gray-500">Select a subject from the left to start browsing.</p>
            </div>
          ) : !chapter ? (
            <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center border-dashed">
              <p className="text-gray-500">Select a chapter to view questions.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">{chapter} Questions ({displayedQuestions.length})</h2>
              
              {displayedQuestions.length === 0 ? (
                <div className="text-center p-8 bg-white rounded-xl border border-gray-200 border-dashed">
                  <p className="text-gray-500">No questions found matching your criteria.</p>
                </div>
              ) : (
                displayedQuestions.map((question) => (
                  <QuestionCard key={question.id} question={question} />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
