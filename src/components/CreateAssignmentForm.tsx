"use client";

import { useState, useTransition } from "react";
import { useAssignment } from "@/components/AssignmentContext";
import { publishAssignmentAction } from "@/app/actions/assignments";
import Link from "next/link";

interface ClassType {
  id: string;
  name: string;
  section: string;
}

export default function CreateAssignmentForm({ classes }: { classes: ClassType[] }) {
  const { selectedQuestions, removeQuestion, clearSelection } = useAssignment();
  const [isPending, startTransition] = useTransition();
  const [publishResult, setPublishResult] = useState<{ success: boolean; linkId?: string; error?: string } | null>(null);

  const totalMarks = selectedQuestions.reduce((acc, q) => acc + q.marks, 0);

  const handlePublish = (formData: FormData) => {
    startTransition(async () => {
      try {
        const result = await publishAssignmentAction(formData, selectedQuestions);
        setPublishResult(result);
        clearSelection();
      } catch (err: any) {
        setPublishResult({ success: false, error: err.message });
      }
    });
  };

  if (publishResult?.success) {
    const link = `${window.location.origin}/student/assignment/${publishResult.linkId}`;
    return (
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 text-center max-w-2xl mx-auto">
        <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Assignment Published!</h2>
        <p className="text-gray-600 mb-6">Your assignment is ready to be shared with students.</p>
        
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-center justify-between mb-8 gap-4">
          <code className="text-sm text-blue-600 truncate">{link}</code>
          <button 
            onClick={() => navigator.clipboard.writeText(link)}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded font-medium hover:bg-blue-200 transition-colors whitespace-nowrap"
          >
            Copy Link
          </button>
        </div>

        <Link href="/teacher/dashboard" className="text-blue-600 hover:text-blue-800 font-medium">
          Return to Dashboard
        </Link>
      </div>
    );
  }

  if (selectedQuestions.length === 0) {
    return (
      <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-200 text-center border-dashed">
        <p className="text-gray-500 mb-4">You haven't selected any questions yet.</p>
        <Link href="/teacher/question-bank" className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
          Browse Question Bank
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Selected Questions Review */}
      <div className="lg:col-span-2 space-y-4">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Selected Questions ({selectedQuestions.length})</h2>
        {selectedQuestions.map((q, index) => (
          <div key={q.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
            <div className="flex justify-between items-start mb-2">
              <span className="text-sm font-medium text-gray-500">Question {index + 1}</span>
              <button 
                onClick={() => removeQuestion(q.id)}
                className="text-red-500 hover:text-red-700 text-sm font-medium"
              >
                Remove
              </button>
            </div>
            <p className="text-gray-900 font-medium">{q.text}</p>
            <div className="mt-3 flex gap-2 text-xs font-medium text-gray-500">
              <span className="bg-gray-100 px-2 py-1 rounded">{q.type.replace(/_/g, ' ')}</span>
              <span className="bg-green-50 text-green-700 px-2 py-1 rounded">{q.marks} Marks</span>
            </div>
          </div>
        ))}
      </div>

      {/* Assignment Setup Form */}
      <div className="lg:col-span-1">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 sticky top-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Publish Assignment</h2>
          
          <form action={handlePublish} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assignment Title</label>
              <input 
                name="title" 
                required 
                placeholder="e.g. Chapter 1 Quiz" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Class</label>
              {classes.length === 0 ? (
                <p className="text-sm text-red-500">No classes found. Please create a class first.</p>
              ) : (
                <select 
                  name="classId" 
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 bg-white"
                >
                  <option value="">Choose a class...</option>
                  {classes.map(c => (
                    <option key={c.id} value={c.id}>{c.name} - Section {c.section}</option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date (Optional)</label>
              <input 
                type="date"
                name="dueDate" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="py-4 border-t border-gray-100 flex justify-between items-center font-bold text-gray-900">
              <span>Total Marks:</span>
              <span className="text-xl">{totalMarks}</span>
            </div>

            {publishResult?.error && (
              <div className="p-3 bg-red-50 text-red-700 text-sm rounded border border-red-200">
                {publishResult.error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={isPending || classes.length === 0}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:bg-blue-400"
            >
              {isPending ? "Publishing..." : "Publish to Students"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
