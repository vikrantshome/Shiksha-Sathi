"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { Question } from "@/lib/questions";

interface AssignmentContextType {
  selectedQuestions: Question[];
  toggleQuestion: (question: Question) => void;
  removeQuestion: (questionId: string) => void;
  clearSelection: () => void;
  isSelected: (questionId: string) => boolean;
}

const AssignmentContext = createContext<AssignmentContextType | undefined>(undefined);

export function AssignmentProvider({ children }: { children: ReactNode }) {
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);

  const toggleQuestion = (question: Question) => {
    setSelectedQuestions((prev) => {
      if (prev.some((q) => q.id === question.id)) {
        return prev.filter((q) => q.id !== question.id);
      } else {
        return [...prev, question];
      }
    });
  };

  const removeQuestion = (questionId: string) => {
    setSelectedQuestions((prev) => prev.filter((q) => q.id !== questionId));
  };

  const clearSelection = () => {
    setSelectedQuestions([]);
  };

  const isSelected = (questionId: string) => {
    return selectedQuestions.some((q) => q.id === questionId);
  };

  return (
    <AssignmentContext.Provider value={{ selectedQuestions, toggleQuestion, removeQuestion, clearSelection, isSelected }}>
      {children}
    </AssignmentContext.Provider>
  );
}

export function useAssignment() {
  const context = useContext(AssignmentContext);
  if (context === undefined) {
    throw new Error("useAssignment must be used within an AssignmentProvider");
  }
  return context;
}
