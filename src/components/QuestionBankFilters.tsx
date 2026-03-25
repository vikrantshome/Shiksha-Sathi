"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useTransition } from "react";

export default function QuestionBankFilters({ 
  subjects, 
  chapters 
}: { 
  subjects: string[], 
  chapters: string[] 
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSubject = searchParams.get("subject") || "";
  const currentChapter = searchParams.get("chapter") || "";
  const currentQuery = searchParams.get("q") || "";
  const currentType = searchParams.get("type") || "ALL";

  const createQueryString = useCallback(
    (name: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value && value !== "ALL") {
        params.set(name, value);
      } else {
        params.delete(name);
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleFilterChange = (name: string, value: string) => {
    startTransition(() => {
      // If changing subject, reset chapter
      let queryString = createQueryString(name, value);
      if (name === "subject") {
        const params = new URLSearchParams(queryString);
        params.delete("chapter");
        queryString = params.toString();
      }
      router.push(`${pathname}?${queryString}`);
    });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {/* Sidebar Browse */}
      <div className="md:col-span-1 space-y-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <h2 className="font-semibold text-gray-900 mb-3">Subjects</h2>
          <ul className="space-y-2">
            {subjects.map(subject => (
              <li key={subject}>
                <button 
                  onClick={() => handleFilterChange("subject", subject)}
                  className={`w-full text-left px-3 py-2 rounded-md transition-colors ${currentSubject === subject ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50 text-gray-700'}`}
                >
                  {subject}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {currentSubject && (
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-3">Chapters</h2>
            <ul className="space-y-2">
              {chapters.map(chapter => (
                <li key={chapter}>
                  <button 
                    onClick={() => handleFilterChange("chapter", chapter)}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${currentChapter === chapter ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50 text-gray-700'}`}
                  >
                    {chapter}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Main Filter Bar for the right column */}
      <div className="md:col-span-3 -mb-2">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4">
          <input 
            type="text" 
            placeholder="Search questions or topics..." 
            defaultValue={currentQuery}
            onChange={(e) => {
              // Debounce search input ideally, but for now just push it
              handleFilterChange("q", e.target.value);
            }}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          />
          <select 
            value={currentType}
            onChange={(e) => handleFilterChange("type", e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
          >
            <option value="ALL">All Types</option>
            <option value="MCQ">Multiple Choice</option>
            <option value="TRUE_FALSE">True / False</option>
            <option value="FILL_IN_BLANKS">Fill in Blanks</option>
          </select>
        </div>
        {isPending && <p className="text-sm text-blue-500 mt-2">Loading...</p>}
      </div>
    </div>
  );
}
