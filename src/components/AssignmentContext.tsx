"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Question } from "@/lib/api/types";

const STORAGE_KEY = "shiksha-sathi-assignment-questions";

interface AssignmentContextType {
  selectedQuestions: Question[];
  toggleQuestion: (question: Question) => void;
  removeQuestion: (questionId: string) => void;
  clearSelection: () => void;
  isSelected: (questionId: string) => boolean;
  updateQuestionPoints: (questionId: string, newPoints: number) => void;
}

const AssignmentContext = createContext<AssignmentContextType | undefined>(undefined);

function loadQuestions(): Question[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveQuestions(questions: Question[]) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
  } catch {
    // Storage full or unavailable — degrade gracefully
  }
}

export function AssignmentProvider({ children }: { children: ReactNode }) {
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  // Load from sessionStorage after hydration to prevent mismatch
  useEffect(() => {
    setSelectedQuestions(loadQuestions());
    setIsHydrated(true);
  }, []);

  // Save to sessionStorage whenever questions change
  useEffect(() => {
    if (isHydrated) {
      saveQuestions(selectedQuestions);
    }
  }, [selectedQuestions, isHydrated]);

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

  const updateQuestionPoints = (questionId: string, newPoints: number) => {
    setSelectedQuestions((prev) =>
      prev.map((q) => (q.id === questionId ? { ...q, points: newPoints } : q))
    );
  };

  return (
    <AssignmentContext.Provider value={{ selectedQuestions, toggleQuestion, removeQuestion, clearSelection, isSelected, updateQuestionPoints }}>
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
