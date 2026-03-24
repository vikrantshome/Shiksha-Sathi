"use client";

import { useState } from "react";
import { questionBank, Question, QuestionType } from "@/lib/questions";

export default function QuestionBankPage() {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<QuestionType | "ALL">("ALL");
  const [previewId, setPreviewId] = useState<string | null>(null);

  const subjects = Array.from(new Set(questionBank.map(q => q.subject)));
  
  const chapters = selectedSubject 
    ? Array.from(new Set(questionBank.filter(q => q.subject === selectedSubject).map(q => q.chapter)))
    : [];

  let displayedQuestions = selectedChapter
    ? questionBank.filter(q => q.subject === selectedSubject && q.chapter === selectedChapter)
    : [];

  // Apply search
  if (searchQuery) {
    const query = searchQuery.toLowerCase();
    displayedQuestions = displayedQuestions.filter(q => 
      q.text.toLowerCase().includes(query) || 
      q.topic.toLowerCase().includes(query)
    );
  }

  // Apply type filter
  if (typeFilter !== "ALL") {
    displayedQuestions = displayedQuestions.filter(q => q.type === typeFilter);
  }

  const handlePreviewToggle = (id: string) => {
    setPreviewId(previewId === id ? null : id);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Question Bank</h1>
          <p className="text-gray-500">Browse, search, and preview questions for your assignments.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar Browse */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
            <h2 className="font-semibold text-gray-900 mb-3">Subjects</h2>
            <ul className="space-y-2">
              {subjects.map(subject => (
                <li key={subject}>
                  <button 
                    onClick={() => { setSelectedSubject(subject); setSelectedChapter(null); setPreviewId(null); }}
                    className={`w-full text-left px-3 py-2 rounded-md transition-colors ${selectedSubject === subject ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50 text-gray-700'}`}
                  >
                    {subject}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {selectedSubject && (
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
              <h2 className="font-semibold text-gray-900 mb-3">Chapters</h2>
              <ul className="space-y-2">
                {chapters.map(chapter => (
                  <li key={chapter}>
                    <button 
                      onClick={() => { setSelectedChapter(chapter); setPreviewId(null); }}
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors ${selectedChapter === chapter ? 'bg-blue-50 text-blue-700 font-medium' : 'hover:bg-gray-50 text-gray-700'}`}
                    >
                      {chapter}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Content Area */}
        <div className="md:col-span-3">
          {!selectedSubject ? (
            <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center border-dashed">
              <p className="text-gray-500">Select a subject from the left to start browsing.</p>
            </div>
          ) : !selectedChapter ? (
            <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center border-dashed">
              <p className="text-gray-500">Select a chapter to view questions.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Filters */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col sm:flex-row gap-4">
                <input 
                  type="text" 
                  placeholder="Search questions or topics..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                />
                <select 
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as QuestionType | "ALL")}
                  className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="ALL">All Types</option>
                  <option value="MCQ">Multiple Choice</option>
                  <option value="TRUE_FALSE">True / False</option>
                  <option value="FILL_IN_BLANKS">Fill in Blanks</option>
                </select>
              </div>

              <h2 className="text-xl font-bold text-gray-900 mt-6 mb-4">{selectedChapter} Questions ({displayedQuestions.length})</h2>
              
              {displayedQuestions.length === 0 ? (
                <div className="text-center p-8 bg-white rounded-xl border border-gray-200 border-dashed">
                  <p className="text-gray-500">No questions found matching your criteria.</p>
                </div>
              ) : (
                displayedQuestions.map((q) => (
                  <div key={q.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200 hover:border-blue-300 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded">
                        {q.topic}
                      </span>
                      <span className="inline-block px-2 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded">
                        {q.type.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <p className="text-gray-900 font-medium">{q.text}</p>
                    
                    {q.options && (
                      <ul className="mt-3 space-y-1">
                        {q.options.map((opt, i) => (
                          <li key={i} className="text-sm text-gray-600 border border-gray-100 p-2 rounded">
                            {String.fromCharCode(65 + i)}. {opt}
                          </li>
                        ))}
                      </ul>
                    )}

                    <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                      <button 
                        onClick={() => handlePreviewToggle(q.id)}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                      >
                        {previewId === q.id ? "Hide Preview" : "Preview Question"}
                      </button>
                      
                      <button className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-3 py-1 rounded text-sm font-medium transition-colors">
                        Add to Assignment
                      </button>
                    </div>

                    {/* Preview Area */}
                    {previewId === q.id && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Teacher Preview</h4>
                        <div className="flex flex-col gap-2 text-sm">
                          <div><span className="font-medium text-gray-700">Correct Answer:</span> <span className="text-green-700 font-medium">{q.correctAnswer}</span></div>
                          <div><span className="font-medium text-gray-700">Marks:</span> {q.marks}</div>
                          <div><span className="font-medium text-gray-700">ID:</span> {q.id}</div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
