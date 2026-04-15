"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Question } from "@/lib/api/types";

const STORAGE_KEY = "shiksha-sathi-quiz-questions";

interface QuizContextType {
  selectedQuestions: Question[];
  toggleQuestion: (question: Question) => void;
  removeQuestion: (questionId: string) => void;
  clearSelection: () => void;
  isSelected: (questionId: string) => boolean;
}

const QuizContext = createContext<QuizContextType | undefined>(undefined);

function loadQuestions(): Question[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveQuestions(questions: Question[]) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
  } catch {
    // Storage full or unavailable — degrade gracefully
  }
}

export function QuizProvider({ children }: { children: ReactNode }) {
  const [selectedQuestions, setSelectedQuestions] = useState<Question[]>([]);
  const [initialized, setInitialized] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = loadQuestions();
    setSelectedQuestions(saved);
    setInitialized(true);
  }, []);

  // Save to localStorage whenever questions change
  useEffect(() => {
    if (initialized) {
      saveQuestions(selectedQuestions);
    }
  }, [selectedQuestions, initialized]);

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
    <QuizContext.Provider value={{ selectedQuestions, toggleQuestion, removeQuestion, clearSelection, isSelected }}>
      {children}
    </QuizContext.Provider>
  );
}

export function useQuiz() {
  const context = useContext(QuizContext);
  if (context === undefined) {
    throw new Error("useQuiz must be used within a QuizProvider");
  }
  return context;
}