"use client";

import { useState, useTransition } from "react";
import { submitAssignmentAction } from "@/app/actions/student";
import { Question } from "@/lib/questions";

interface StudentAssignmentFormProps {
  assignment: {
    id: string;
    title: string;
    totalMarks: number;
    questions: Omit<Question, 'correctAnswer'>[];
  };
}

export default function StudentAssignmentForm({ assignment }: StudentAssignmentFormProps) {
  const [identity, setIdentity] = useState<{ name: string; rollNumber: string } | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ success: boolean; score: number; totalMarks: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleIdentitySubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    setIdentity({
      name: formData.get("name") as string,
      rollNumber: formData.get("rollNumber") as string,
    });
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const handleSubmitAssignment = () => {
    if (!identity) return;
    
    // Check if all questions are answered
    if (Object.keys(answers).length < assignment.questions.length) {
      setError("Please answer all questions before submitting.");
      return;
    }
    
    setError(null);
    startTransition(async () => {
      try {
        const res = await submitAssignmentAction(assignment.id, identity, answers);
        setResult(res);
      } catch (err: any) {
        setError(err.message || "Failed to submit assignment");
      }
    });
  };

  if (result) {
    return (
      <div className="p-8 text-center">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Assignment Submitted!</h2>
        <p className="text-gray-600 mb-8">Thank you, {identity?.name}. Your responses have been recorded.</p>
        
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-6 max-w-sm mx-auto">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide mb-2">Your Score</h3>
          <div className="text-4xl font-extrabold text-blue-600">
            {result.score} <span className="text-xl text-gray-400">/ {result.totalMarks}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!identity) {
    return (
      <div className="p-6 sm:p-8">
        <div className="max-w-md mx-auto">
          <h2 className="text-xl font-bold text-gray-900 mb-6 text-center">Enter your details to start</h2>
          <form onSubmit={handleIdentitySubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input 
                name="name" 
                required 
                placeholder="e.g. John Doe" 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student ID / Roll Number</label>
              <input 
                name="rollNumber" 
                required 
                placeholder="e.g. 101" 
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Start Assignment
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-6 pb-6 border-b border-gray-200 flex justify-between items-center">
        <div>
          <span className="text-sm text-gray-500">Student</span>
          <p className="font-medium text-gray-900">{identity.name} ({identity.rollNumber})</p>
        </div>
        <div className="text-right">
          <span className="text-sm text-gray-500">Progress</span>
          <p className="font-medium text-blue-600">{Object.keys(answers).length} / {assignment.questions.length} Answered</p>
        </div>
      </div>

      <div className="space-y-8">
        {assignment.questions.map((q, index) => (
          <div key={q.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="text-sm font-bold text-gray-500">Question {index + 1}</span>
              <span className="text-sm font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">{q.marks} Marks</span>
            </div>
            <p className="text-lg text-gray-900 font-medium mb-4">{q.text}</p>
            
            {q.options && (q.type === "MCQ" || q.type === "TRUE_FALSE") ? (
              <div className="space-y-2">
                {q.options.map((opt, i) => (
                  <label 
                    key={i} 
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${answers[q.id] === opt ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'}`}
                  >
                    <input 
                      type="radio" 
                      name={`question-${q.id}`} 
                      value={opt}
                      checked={answers[q.id] === opt}
                      onChange={() => handleAnswerChange(q.id, opt)}
                      className="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <span className="ml-3 text-gray-700">{opt}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div>
                <input 
                  type="text" 
                  value={answers[q.id] || ""}
                  onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                  placeholder="Type your answer here..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
              </div>
            )}
          </div>
        ))}
      </div>

      {error && (
        <div className="mt-8 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 text-center">
          {error}
        </div>
      )}

      <div className="mt-8 pt-6 border-t border-gray-200">
        <button 
          onClick={handleSubmitAssignment}
          disabled={isPending}
          className="w-full sm:w-auto sm:min-w-[200px] float-right bg-blue-600 text-white py-3 px-6 rounded-lg font-bold text-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400"
        >
          {isPending ? "Submitting..." : "Submit Assignment"}
        </button>
        <div className="clear-both"></div>
      </div>
    </div>
  );
}
