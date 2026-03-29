"use client";

import { useAssignment } from "@/components/AssignmentContext";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function AssignmentTray() {
  const { selectedQuestions, removeQuestion } = useAssignment();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null; // Avoid hydration mismatch

  if (selectedQuestions.length === 0) {
    return (
      <div className="sticky top-6 hidden lg:flex flex-col h-[calc(100vh-6rem)] p-4 bg-surface-container-lowest rounded-xl border border-outline-variant">
        <h2 className="text-label-md text-on-surface-variant font-medium mb-4">Assignment Basket</h2>
        <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
          <div className="w-12 h-12 bg-surface-container rounded-full flex items-center justify-center mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-on-surface-variant">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <p className="text-body-sm text-on-surface-variant mb-2">No questions selected</p>
          <p className="text-label-sm text-on-surface-variant/70">Click + on questions to add them</p>
        </div>
      </div>
    );
  }

  const totalMarks = selectedQuestions.reduce((acc, q) => acc + q.points, 0);

  return (
    <>
      {/* Desktop Sticky Tray */}
      <div className="sticky top-6 hidden lg:flex flex-col h-[calc(100vh-6rem)] p-4 bg-surface-container-lowest rounded-xl border border-outline-variant">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-label-md text-on-surface-variant font-medium">Assignment Basket</h2>
          <span className="badge bg-primary-container text-on-primary-container">{selectedQuestions.length} Qs</span>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
          {selectedQuestions.map((q, index) => (
            <div key={q.id} className="p-3 bg-surface-container-low rounded-lg relative group">
              <button 
                onClick={() => removeQuestion(q.id)}
                className="absolute top-2 right-2 w-6 h-6 rounded-full bg-surface-container hover:bg-error hover:text-white flex items-center justify-center text-on-surface-variant transition-colors"
                title="Remove"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <p className="text-body-sm text-on-surface font-medium pr-6 line-clamp-2">{q.text}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-label-sm text-on-surface-variant">{q.points} {q.points === 1 ? 'Mark' : 'Marks'}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="pt-4 mt-4 border-t border-outline-variant">
          <div className="flex justify-between items-center mb-4">
            <span className="text-body-sm text-on-surface-variant">Total Marks</span>
            <span className="text-headline-xs">{totalMarks}</span>
          </div>
          <Link href="/teacher/assignments/create" className="btn-primary w-full justify-center">
            Continue to Publish →
          </Link>
        </div>
      </div>

      {/* Mobile/Tablet Floating Action Bar */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-sm">
        <div className="bg-surface-container-high rounded-full px-5 py-3 shadow-[0_8px_24px_rgba(0,0,0,0.12)] flex items-center justify-between border border-outline-variant">
          <div className="flex flex-col">
            <span className="text-label-sm text-on-surface-variant">{selectedQuestions.length} Questions</span>
            <span className="text-body-sm font-semibold text-on-surface">{totalMarks} Marks</span>
          </div>
          <Link href="/teacher/assignments/create" className="btn-primary rounded-full px-6 text-sm">
            Publish
          </Link>
        </div>
      </div>
    </>
  );
}
