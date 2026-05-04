"use client";

import { useState } from "react";
import Link from "next/link";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  MeasuringStrategy,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Question } from "@/lib/api/types";

interface QuizQuestionReviewProps {
  questions: Question[];
  onReorder: (questions: Question[]) => void;
  onRemove: (questionId: string) => void;
  totalMarks: number;
}

interface SortableQuestionProps {
  question: Question;
  index: number;
  isExpanded: boolean;
  isOverlay?: boolean;
  onToggleExpand: () => void;
  onRequestRemove: (question: Question) => void;
}

function SortableQuestion({ question, index, isExpanded, isOverlay, onToggleExpand, onRequestRemove }: SortableQuestionProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: question.id,
    transition: {
      duration: 250,
      easing: 'cubic-bezier(0.25, 1, 0.5, 1)',
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    willChange: isDragging ? 'transform' : undefined,
    touchAction: 'none',
  };

  const getTypeColors = (type: string) => {
    switch (type) {
      case "MCQ":
        return {
          primary: "#0d5a54",
          onPrimary: "#ffffff",
          container: "#bcece6",
          onContainer: "#00201e",
        };
      case "TRUE_FALSE":
        return {
          primary: "#3d6b4f",
          onPrimary: "#ffffff",
          container: "#d6e7d6",
          onContainer: "#0a2e12",
        };
      default:
        return {
          primary: "#8b4513",
          onPrimary: "#ffffff",
          container: "#ffdbce",
          onContainer: "#2e0c00",
        };
    }
  };

  const colors = getTypeColors(question.type);
  
  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        group relative rounded-xl border border-[var(--color-outline-variant)] bg-white
        overflow-hidden
        ${isDragging && !isOverlay ? "opacity-30" : ""}
        ${isOverlay ? "shadow-2xl rotate-1 scale-[1.02] z-50 cursor-grabbing ring-2 ring-[var(--color-primary)]/20" : "hover:shadow-md hover:border-[var(--color-outline)] hover:-translate-y-0.5 transition-all duration-200"}
      `}
    >
      {/* Left accent border - colored by question type */}
      <div className="absolute left-0 top-0 bottom-0 w-[4px] rounded-l-xl" style={{ backgroundColor: colors.primary }} />
      {/* Drag Handle */}
      <div
        {...attributes}
        {...listeners}
        className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 cursor-grab active:cursor-grabbing text-[var(--color-outline)] hover:text-[var(--color-on-surface-variant)] transition-colors rounded-lg hover:bg-black/5"
        title="Drag to reorder"
      >
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
          <circle cx="8" cy="6" r="1.5" />
          <circle cx="16" cy="6" r="1.5" />
          <circle cx="8" cy="12" r="1.5" />
          <circle cx="16" cy="12" r="1.5" />
          <circle cx="8" cy="18" r="1.5" />
          <circle cx="16" cy="18" r="1.5" />
        </svg>
      </div>

        {/* Main Content */}
      <div className="pl-10 pr-4 py-3">
        {/* Header Row */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="w-6 h-6 flex items-center justify-center rounded-full text-[11px] font-bold shadow-sm" style={{ backgroundColor: colors.primary, color: colors.onPrimary }}>
            {index + 1}
          </span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1" style={{ backgroundColor: colors.container + '80', color: colors.onContainer }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.primary }} />
            {question.type.replace(/_/g, " ")}
          </span>
          <span className="text-[11px] text-[var(--color-on-surface-variant)] font-medium">
            {question.points || 1} pt
          </span>
          <div className="flex-1" />
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={onToggleExpand}
              className="text-[11px] font-medium px-2 py-1 rounded-md transition-colors hover:bg-black/5"
              style={{ color: colors.onContainer }}
            >
              {isExpanded ? "Collapse" : "Details"}
            </button>
            <button
              type="button"
              onClick={() => onRequestRemove(question)}
              className="p-1.5 rounded-full text-[var(--color-outline)] hover:text-[var(--color-error)] hover:bg-[var(--color-error-container)]/30 transition-all focus:outline-none focus:ring-2 focus:ring-[var(--color-error)]/20"
              title="Remove question"
              aria-label="Remove question"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Question Text */}
        <p className={`text-[13px] text-[var(--color-on-surface)] mt-2 leading-relaxed ${isExpanded ? "" : "line-clamp-2"}`}>
          {question.text}
        </p>

        {/* Expanded Details */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-[var(--color-surface-variant)] animate-fade-in">
            {/* Options */}
            {question.options && question.options.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {question.options.map((opt, i) => {
                  const isCorrect = question.correctAnswers?.includes(opt) || question.correctAnswer === opt;
                  return (
                    <div
                      key={i}
                      className="text-xs px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2"
                      style={isCorrect ? { backgroundColor: colors.primary + '14', color: colors.primary } : { backgroundColor: '#f7f3ee', color: '#4a4542' }}
                    >
                      <span className="w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold" style={isCorrect ? { backgroundColor: colors.primary, color: '#ffffff' } : { backgroundColor: 'var(--color-surface-container)', color: 'var(--color-on-surface-variant)' }}>
                        {String.fromCharCode(65 + i)}
                      </span>
                      <span className="flex-1">{opt}</span>
                      {isCorrect && (
                        <svg className="w-3.5 h-3.5" style={{ color: colors.primary }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function QuizQuestionReview({ questions, onReorder, onRemove, totalMarks }: QuizQuestionReviewProps) {
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set());
  const [questionToRemove, setQuestionToRemove] = useState<Question | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (over && active.id !== over.id) {
      const oldIndex = questions.findIndex((q) => q.id === active.id);
      const newIndex = questions.findIndex((q) => q.id === over.id);
      onReorder(arrayMove(questions, oldIndex, newIndex));
    }
  };

  const toggleExpand = (questionId: string) => {
    setExpandedQuestions((prev) => {
      const next = new Set(prev);
      if (next.has(questionId)) {
        next.delete(questionId);
      } else {
        next.add(questionId);
      }
      return next;
    });
  };

  const activeQuestion = activeId ? questions.find((q) => q.id === activeId) : null;
  const activeIndex = activeId ? questions.findIndex((q) => q.id === activeId) : -1;

  if (questions.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-outline-variant/30 bg-surface-container-low/50 p-8 text-center">
        <div className="w-14 h-14 rounded-2xl bg-primary-container flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-on-primary-container" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <p className="text-[14px] font-bold text-on-surface mb-1">No questions selected</p>
        <p className="text-[12px] text-on-surface-variant/70 mb-4">Add questions from the Question Bank to get started</p>
        <Link
          href="/teacher/question-bank?context=quiz"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[13px] font-bold text-on-primary bg-primary hover:bg-primary/90 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m0-14l7 7m-7-7l-7 7" />
          </svg>
          Browse Questions
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bento Grid Stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-primary-container/30 rounded-xl p-3 flex flex-col items-center border border-primary/15">
          <div className="w-8 h-8 rounded-lg bg-primary-container/50 flex items-center justify-center mb-1">
            <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <span className="text-[14px] font-bold text-primary">{questions.length}</span>
          <span className="text-[10px] font-medium text-on-primary-container/70">Questions</span>
        </div>
        <div className="bg-secondary-container/30 rounded-xl p-3 flex flex-col items-center border border-secondary/15">
          <div className="w-8 h-8 rounded-lg bg-secondary-container/50 flex items-center justify-center mb-1">
            <svg className="w-4 h-4 text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="text-[14px] font-bold text-secondary">{totalMarks}</span>
          <span className="text-[10px] font-medium text-on-secondary-container/70">Points</span>
        </div>
        <div className="bg-tertiary-container/30 rounded-xl p-3 flex flex-col items-center border border-tertiary/15">
          <div className="w-8 h-8 rounded-lg bg-tertiary-container/50 flex items-center justify-center mb-1">
            <svg className="w-4 h-4 text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h7" />
            </svg>
          </div>
          <span className="text-[14px] font-bold text-tertiary">{questions.reduce((a, q) => a + (q.options?.length || 0), 0)}</span>
          <span className="text-[10px] font-medium text-on-tertiary-container/70">Options</span>
        </div>
      </div>

      {/* Draggable Question List */}
      <DndContext 
        sensors={sensors} 
        collisionDetection={closestCenter} 
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        measuring={{
          droppable: {
            strategy: MeasuringStrategy.BeforeDragging,
          },
        }}
      >
        <SortableContext items={questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {questions.map((question, index) => (
              <div
                key={question.id}
                className={activeId === question.id ? "opacity-0" : ""}
              >
                <SortableQuestion
                  question={question}
                  index={index}
                  isExpanded={expandedQuestions.has(question.id)}
                  onToggleExpand={() => toggleExpand(question.id)}
                  onRequestRemove={(q) => setQuestionToRemove(q)}
                />
              </div>
            ))}
          </div>
        </SortableContext>

        {/* DragOverlay renders the item being dragged in a portal for smooth visuals */}
        <DragOverlay>
          {activeQuestion && activeIndex >= 0 ? (
            <SortableQuestion
              question={activeQuestion}
              index={activeIndex}
              isExpanded={false}
              isOverlay
              onToggleExpand={() => {}}
              onRequestRemove={() => {}}
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Add More Button */}
      <Link
        href="/teacher/question-bank?context=quiz"
        className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-primary/30 text-primary hover:bg-primary-container/40 hover:border-primary/50 transition-all font-medium"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14m0-14l7 7m-7-7l-7 7" />
        </svg>
        <span className="text-[13px]">Add More Questions</span>
      </Link>

      {/* Remove Confirmation Dialog */}
      {questionToRemove && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={() => setQuestionToRemove(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="remove-dialog-title"
        >
          <div
            className="bg-surface-container-lowest rounded-2xl p-6 max-w-sm w-full mx-4 shadow-xl border border-outline-variant/20 animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-error-container flex items-center justify-center">
                <svg className="w-5 h-5 text-on-error-container" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 id="remove-dialog-title" className="text-[16px] font-bold text-on-surface">Remove Question?</h3>
                <p className="text-[12px] text-on-surface-variant/60">This action cannot be undone</p>
              </div>
            </div>

            <p className="text-[13px] text-on-surface-variant mb-6 line-clamp-2">
              &ldquo;{questionToRemove.text}&rdquo;
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setQuestionToRemove(null)}
                className="flex-1 px-4 py-2.5 rounded-xl text-[13px] font-semibold text-on-surface-variant hover:bg-surface-container-high transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  onRemove(questionToRemove.id);
                  setQuestionToRemove(null);
                }}
                className="flex-1 px-4 py-2.5 rounded-xl text-[13px] font-semibold bg-error-container text-on-error-container hover:bg-error-container/80 transition-colors"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
