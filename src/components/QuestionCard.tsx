"use client";

import { useState } from "react";
import { Question } from "@/lib/api/types";
import { useAssignment } from "./AssignmentContext";

export default function QuestionCard({ question: q }: { question: Question }) {
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { toggleQuestion, isSelected } = useAssignment();
  
  const selected = isSelected(q.id);

  return (
    <div className={`bg-white p-5 rounded-xl shadow-sm border transition-colors ${selected ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200 hover:border-blue-300'}`}>
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
            <li key={i} className="text-sm text-gray-600 border border-gray-100 p-2 rounded bg-white">
              {String.fromCharCode(65 + i)}. {opt}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
        <button 
          onClick={() => setIsPreviewOpen(!isPreviewOpen)}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          {isPreviewOpen ? "Hide Preview" : "Preview Question"}
        </button>
        
        <button 
          onClick={() => toggleQuestion(q)}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${selected ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
        >
          {selected ? "Added" : "Add to Assignment"}
        </button>
      </div>

      {/* Preview Area */}
      {isPreviewOpen && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Teacher Preview</h4>
          <div className="flex flex-col gap-2 text-sm">
            <div><span className="font-medium text-gray-700">Correct Answer:</span> <span className="text-green-700 font-medium">{q.correctAnswer}</span></div>
            <div><span className="font-medium text-gray-700">Points:</span> {q.points}</div>
            <div><span className="font-medium text-gray-700">ID:</span> {q.id}</div>
          </div>
        </div>
      )}
    </div>
  );
}
