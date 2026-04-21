"use client";

import { useEffect, useState, useMemo } from "react";
import { api } from "@/lib/api";
import type { AssignmentWithStats } from "@/lib/api/types";
import Link from "next/link";

type FilterType = "active" | "past";

interface GroupedAssignments {
  [className: string]: AssignmentWithStats[];
}

function PlusIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function FolderIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function FileTextIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function CheckCircleIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <line x1="18" y1="20" x2="18" y2="10" />
      <line x1="12" y1="20" x2="12" y2="4" />
      <line x1="6" y1="20" x2="6" y2="14" />
    </svg>
  );
}

function ChevronDownIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function PlayIcon() {
  return (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function HistoryIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M3 3v5h5" />
      <path d="M3.05 13A9 9 0 1 0 6 5.3L3 8" />
      <path d="M12 7v5l4 2" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: "var(--color-primary-container)" }}>
        <FolderIcon />
      </div>
      <h3 className="text-xl font-bold text-on-surface mb-2">No Assignments Yet</h3>
      <p className="text-on-surface-variant text-center max-w-sm mb-6">
        Create your first assignment to start collecting submissions from students
      </p>
      <Link
        href="/teacher/assignments/create"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold transition-all hover:shadow-elevated1 active:scale-95"
        style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}
      >
        <PlusIcon />
        Create Assignment
      </Link>
    </div>
  );
}

function ActiveEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: "var(--color-primary-container)" }}>
        <PlayIcon />
      </div>
      <h3 className="text-xl font-bold text-on-surface mb-2">No Active Assignments</h3>
      <p className="text-on-surface-variant text-center max-w-sm mb-6">
        All your assignments are past or closed. Create a new one to get started.
      </p>
      <Link
        href="/teacher/assignments/create"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold transition-all hover:shadow-elevated1 active:scale-95"
        style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}
      >
        <PlusIcon />
        Create Assignment
      </Link>
    </div>
  );
}

function PastEmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: "var(--color-surface-container)" }}>
        <HistoryIcon />
      </div>
      <h3 className="text-xl font-bold text-on-surface mb-2">No Past Assignments</h3>
      <p className="text-on-surface-variant text-center max-w-sm">
        You don't have any closed or overdue assignments yet.
      </p>
    </div>
  );
}

function ClassSection({ 
  className, 
  assignments,
  expanded,
  onToggle,
  onExport
}: { 
  className: string; 
  assignments: AssignmentWithStats[];
  expanded: boolean;
  onToggle: () => void;
  onExport?: () => void;
}) {
  const totalSubmissions = assignments.reduce((acc, a) => acc + (a.submissionCount || 0), 0);
  const publishedCount = assignments.filter(a => a.status === "PUBLISHED").length;

  return (
    <div className="rounded-xl overflow-hidden" style={{ background: "var(--color-surface-container-low)", border: "1px solid var(--color-outline-variant)" }}>
      <div
        className="w-full flex items-center justify-between p-4 md:p-5 transition-colors hover:opacity-80"
        style={{ background: "var(--color-surface-container)" }}
      >
        <button
          onClick={onToggle}
          className="flex items-center gap-3 flex-1"
        >
          <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "var(--color-primary-container)" }}>
            <span className="text-sm font-bold" style={{ color: "var(--color-on-primary-container)" }}>{className}</span>
          </div>
          <div className="text-left">
            <h3 className="text-base font-bold text-on-surface">Class {className}</h3>
            <p className="text-sm text-on-surface-variant">
              {assignments.length} assignment{assignments.length !== 1 ? 's' : ''} • {totalSubmissions} submission{totalSubmissions !== 1 ? 's' : ''} • {publishedCount} published
            </p>
          </div>
        </button>
        <div className="flex items-center gap-2">
          {onExport && assignments.length > 0 && (
            <button
              onClick={onExport}
              className="p-2 rounded-lg transition-colors hover:opacity-80"
              style={{ background: "var(--color-surface-container-low)", color: "var(--color-on-surface)" }}
              aria-label={`Export ${className} assignments`}
            >
              <DownloadIcon />
            </button>
          )}
          <button
            onClick={onToggle}
            className={`transition-transform ${expanded ? 'rotate-180' : ''}`}
            aria-label={expanded ? "Collapse" : "Expand"}
          >
            <ChevronDownIcon />
          </button>
        </div>
      </div>

      {expanded && (
        <div className="divide-y" style={{ borderTop: "1px solid var(--color-outline-variant)" }}>
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="p-4 md:p-5 hover:opacity-90 transition-opacity"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-base font-semibold text-on-surface truncate">{assignment.title}</h4>
                    <span className={`shrink-0 px-2 py-0.5 rounded-full text-xs font-bold ${
                      assignment.status === "PUBLISHED" 
                        ? "bg-green-100 text-green-800" 
                        : "bg-amber-100 text-amber-800"
                    }`}>
                      {assignment.status === "PUBLISHED" ? "Live" : "Draft"}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-on-surface-variant">
                    <span className="flex items-center gap-1">
                      <FileTextIcon />
                      {assignment.questionIds?.length || 0} Q
                    </span>
                    <span className="flex items-center gap-1">
                      <UsersIcon />
                      {assignment.submissionCount || 0} submissions
                    </span>
                    <span className="flex items-center gap-1">
                      <CheckCircleIcon />
                      {assignment.averageScore?.toFixed(0) || 0}% avg
                    </span>
                  </div>
                </div>

                <Link
                  href={`/teacher/assignments/${assignment.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all hover:shadow-elevated1 active:scale-95 whitespace-nowrap"
                  style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}
                >
                  <ChartIcon />
                  View Report
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<AssignmentWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedClasses, setExpandedClasses] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<FilterType>("active");

  function isAssignmentActive(assignment: AssignmentWithStats): boolean {
    if (assignment.status === "CLOSED") return false;
    if (!assignment.dueDate) return true;
    return new Date(assignment.dueDate) > new Date();
  }

  function isAssignmentPast(assignment: AssignmentWithStats): boolean {
    if (assignment.status === "CLOSED") return true;
    if (assignment.dueDate && new Date(assignment.dueDate) < new Date()) return true;
    return false;
  }

  const filteredAssignments = useMemo(() => {
    if (filter === "active") {
      return assignments.filter(isAssignmentActive);
    } else {
      return assignments.filter(isAssignmentPast);
    }
  }, [assignments, filter]);

  const activeCount = useMemo(() => 
    assignments.filter(isAssignmentActive).length, 
  [assignments]);

  const pastCount = useMemo(() => 
    assignments.filter(isAssignmentPast).length, 
  [assignments]);

  useEffect(() => {
    async function loadAssignments() {
      try {
        const user = await api.auth.getMe();
        const stats = await api.assignments.getStats(user.id);
        setAssignments(stats);
        // Auto-expand first class
        if (stats.length > 0) {
          const classes = [...new Set(stats.map(a => a.className || "Ungrouped"))];
          if (classes.length > 0) {
            setExpandedClasses(new Set([classes[0]]));
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load assignments");
      } finally {
        setLoading(false);
      }
    }
    loadAssignments();
  }, []);

  const groupedAssignments = useMemo(() => {
    const groups: GroupedAssignments = {};
    filteredAssignments.forEach((assignment) => {
      const className = assignment.className || "Ungrouped";
      if (!groups[className]) {
        groups[className] = [];
      }
      groups[className].push(assignment);
    });
    return groups;
  }, [filteredAssignments]);

  const classNames = Object.keys(groupedAssignments).sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, '')) || 0;
    const numB = parseInt(b.replace(/\D/g, '')) || 0;
    return numA - numB;
  });

  const toggleClass = (className: string) => {
    setExpandedClasses(prev => {
      const next = new Set(prev);
      if (next.has(className)) {
        next.delete(className);
      } else {
        next.add(className);
      }
      return next;
    });
  };

  const allGroupedAssignments = useMemo(() => {
    const groups: GroupedAssignments = {};
    assignments.forEach((assignment) => {
      const className = assignment.className || "Ungrouped";
      if (!groups[className]) {
        groups[className] = [];
      }
      groups[className].push(assignment);
    });
    return groups;
  }, [assignments]);

  const handleExportClass = async (className: string) => {
    const classAssignments = allGroupedAssignments[className];
    if (!classAssignments || classAssignments.length === 0) return;

    const sanitizeFilename = (name: string) => name.replace(/[^a-zA-Z0-9]/g, "_");
    const formatDate = (date: string | null | undefined) => {
      if (!date) return "No due date";
      return new Date(date).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric"
      });
    };
    const formatStatus = (status: string) => {
      if (status === "PUBLISHED") return "Published";
      if (status === "CLOSED") return "Closed";
      return "Draft";
    };
    const escapeCSV = (field: string | number) => {
      const str = String(field);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const allSubmissions: Record<string, { studentName: string; rollNumber: string; score: number }[]> = {};
    for (const assignment of classAssignments) {
      try {
        const subs = await api.assignments.getSubmissions(assignment.id);
        allSubmissions[assignment.id] = subs.map(s => ({
          studentName: s.studentName,
          rollNumber: s.studentRollNumber,
          score: s.score
        }));
      } catch {
        allSubmissions[assignment.id] = [];
      }
    }

    const studentMap = new Map<string, { name: string; scores: Record<string, number> }>();
    for (const assignment of classAssignments) {
      const subs = allSubmissions[assignment.id] || [];
      for (const sub of subs) {
        const key = sub.rollNumber || sub.studentName;
        if (!studentMap.has(key)) {
          studentMap.set(key, { name: sub.studentName, scores: {} });
        }
        studentMap.get(key)!.scores[assignment.id] = sub.score;
      }
    }

    const studentRows = Array.from(studentMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([key, data]) => {
        const row: (string | number)[] = [escapeCSV(data.name), escapeCSV(key)];
        let totalScore = 0;
        let totalMax = 0;
        for (const assignment of classAssignments) {
          const score = data.scores[assignment.id] ?? 0;
          row.push(escapeCSV(score));
          totalScore += score;
          totalMax += assignment.totalMarks || 100;
        }
        row.push(escapeCSV(totalScore));
        row.push(escapeCSV(totalMax > 0 ? ((totalScore / totalMax) * 100).toFixed(0) + "%" : "0%"));
        return row;
      });

    const assignmentHeaders = classAssignments.map(a => 
      escapeCSV(`${a.title.slice(0, 20)}${a.title.length > 20 ? "..." : ""} (${a.totalMarks || 100})`)
    );
    const sheet1Headers = ["Student Name", "Roll Number", ...assignmentHeaders, "Total Score", "Percentage"];
    const sheet1Content = [sheet1Headers.join(","), ...studentRows.map(r => r.join(","))].join("\n");

    const sheet2Headers = ["Title", "Status", "Due Date", "Questions", "Submissions", "Avg Score", "Code"];
    const sheet2Rows = classAssignments.map(a => [
      escapeCSV(a.title),
      escapeCSV(formatStatus(a.status)),
      escapeCSV(formatDate(a.dueDate)),
      escapeCSV(a.questionIds?.length || 0),
      escapeCSV(a.submissionCount || 0),
      escapeCSV(a.averageScore?.toFixed(0) || 0),
      escapeCSV(a.code || "")
    ]);
    const sheet2Content = [sheet2Headers.join(","), ...sheet2Rows.map(r => r.join(","))].join("\n");

    const finalContent = `${sheet1Content}\n\n${sheet2Content}`;
    const blob = new Blob([finalContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `Class_${sanitizeFilename(className)}_scores.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    window.open("https://docs.google.com/spreadsheets/u/0/", "_blank");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-10 h-10 border-3 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" 
               style={{ borderColor: "var(--color-primary)", borderTopColor: "transparent" }} />
          <p className="text-on-surface-variant">Loading assignments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="p-4 rounded-lg" style={{ background: "var(--color-error-container)", color: "var(--color-on-error)" }}>
          <p className="font-medium">{error}</p>
        </div>
      </div>
    );
  }

  const totalAssignments = assignments.length;
  const totalSubmissions = assignments.reduce((acc, a) => acc + (a.submissionCount || 0), 0);
  const publishedAssignments = assignments.filter(a => a.status === "PUBLISHED").length;

  return (
    <div className="max-w-4xl mx-auto pb-12">
      {/* Header */}
      <div className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-on-surface tracking-tight">
              Assignments
            </h1>
            <p className="text-on-surface-variant mt-1">
              Manage and track all your class assignments
            </p>
          </div>
          <Link
            href="/teacher/assignments/create"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold transition-all hover:shadow-elevated1 active:scale-95"
            style={{ background: "var(--color-primary)", color: "var(--color-on-primary)" }}
          >
            <PlusIcon />
            New Assignment
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      {totalAssignments > 0 && (
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="p-4 rounded-xl text-center" style={{ background: "var(--color-surface-container-low)", border: "1px solid var(--color-outline-variant)" }}>
            <div className="text-2xl md:text-3xl font-bold" style={{ color: "var(--color-primary)" }}>{totalAssignments}</div>
            <div className="text-sm text-on-surface-variant mt-1">Total</div>
          </div>
          <div className="p-4 rounded-xl text-center" style={{ background: "var(--color-surface-container-low)", border: "1px solid var(--color-outline-variant)" }}>
            <div className="text-2xl md:text-3xl font-bold" style={{ color: "var(--color-primary)" }}>{publishedAssignments}</div>
            <div className="text-sm text-on-surface-variant mt-1">Published</div>
          </div>
          <div className="p-4 rounded-xl text-center" style={{ background: "var(--color-surface-container-low)", border: "1px solid var(--color-outline-variant)" }}>
            <div className="text-2xl md:text-3xl font-bold" style={{ color: "var(--color-primary)" }}>{totalSubmissions}</div>
            <div className="text-sm text-on-surface-variant mt-1">Submissions</div>
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      {totalAssignments > 0 && (
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter("active")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
              filter === "active" 
                ? "shadow-elevated1" 
                : "opacity-70 hover:opacity-100"
            }`}
            style={{ 
              background: filter === "active" ? "var(--color-primary)" : "var(--color-surface-container)",
              color: filter === "active" ? "var(--color-on-primary)" : "var(--color-on-surface)"
            }}
          >
            <PlayIcon />
            Active
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              filter === "active"
                ? "bg-white/20"
                : "bg-primary/10"
            }`}>
              {activeCount}
            </span>
          </button>
          <button
            onClick={() => setFilter("past")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold transition-all ${
              filter === "past" 
                ? "shadow-elevated1" 
                : "opacity-70 hover:opacity-100"
            }`}
            style={{ 
              background: filter === "past" ? "var(--color-primary)" : "var(--color-surface-container)",
              color: filter === "past" ? "var(--color-on-primary)" : "var(--color-on-surface)"
            }}
          >
            <ClockIcon />
            Past
            <span className={`px-2 py-0.5 rounded-full text-xs ${
              filter === "past"
                ? "bg-white/20"
                : "bg-primary/10"
            }`}>
              {pastCount}
            </span>
          </button>
        </div>
      )}

      {/* Assignments List */}
      {totalAssignments === 0 ? (
        <EmptyState />
      ) : filteredAssignments.length === 0 ? (
        filter === "active" ? <ActiveEmptyState /> : <PastEmptyState />
      ) : (
        <div className="space-y-4">
          {classNames.map((className) => (
            <ClassSection
              key={className}
              className={className}
              assignments={groupedAssignments[className]}
              expanded={expandedClasses.has(className)}
              onToggle={() => toggleClass(className)}
              onExport={() => handleExportClass(className)}
            />
          ))}
        </div>
      )}
    </div>
  );
}