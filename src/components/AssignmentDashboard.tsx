"use client";

import { AssignmentWithStats } from "@/lib/api/types";
import Link from "next/link";
import { useState, useMemo } from "react";

/* ── Icons ── */
const IconChevronRight = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6" />
  </svg>
);
const IconSearch = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
  </svg>
);
const IconSort = ({ active, direction }: { active: boolean; direction: 'asc' | 'desc' }) => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${!active ? 'opacity-20' : 'opacity-100'} ${active && direction === 'desc' ? 'rotate-180' : ''}`}>
    <path d="m7 15 5 5 5-5" /><path d="m7 9 5-5 5 5" />
  </svg>
);
const IconFilter = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

interface Props {
  initialAssignments: AssignmentWithStats[];
  totalSubmissions: number;
  avgScoreAll: string;
}

type SortKey = 'title' | 'className' | 'submissionCount' | 'averageScore' | 'dueDate';

export default function AssignmentDashboard({ initialAssignments, totalSubmissions, avgScoreAll }: Props) {
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({
    key: 'dueDate',
    direction: 'desc'
  });

  const distinctClasses = useMemo(() => {
    return Array.from(new Set(initialAssignments.map(a => a.className).filter(Boolean))).sort();
  }, [initialAssignments]);

  const filteredAndSorted = useMemo(() => {
    let list = initialAssignments.filter(a => {
      const matchesSearch = a.title.toLowerCase().includes(search.toLowerCase());
      const matchesClass = classFilter === "all" || a.className === classFilter;
      const matchesStatus = statusFilter === "all" || a.status === statusFilter;
      return matchesSearch && matchesClass && matchesStatus;
    });

    list.sort((a, b) => {
      let valA = a[sortConfig.key];
      let valB = b[sortConfig.key];

      if (sortConfig.key === 'dueDate') {
        valA = new Date(a.dueDate || 0).getTime();
        valB = new Date(b.dueDate || 0).getTime();
      }

      if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
      if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [initialAssignments, search, classFilter, statusFilter, sortConfig]);

  const handleSort = (key: SortKey) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PUBLISHED': return 'bg-success-container text-on-success-container border-success/10';
      case 'DRAFT': return 'bg-warning-container text-on-warning-container border-warning/10';
      case 'CLOSED': return 'bg-surface-container-high text-on-surface-variant border-outline/10';
      default: return 'bg-surface-container text-on-surface-variant';
    }
  };

  return (
    <>
      {/* ═══ Analytics Dashboard Cards ═══ */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-[#f0ede9] p-6 rounded-2xl border border-[#c0c8c6]/30 flex flex-col justify-center">
          <h3 className="text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-[#707977] mb-2">Total Assignments</h3>
          <p className="text-3xl font-black text-[#12423f] m-0">{initialAssignments.length}</p>
        </div>
        <div className="bg-[#f0ede9] p-6 rounded-2xl border border-[#c0c8c6]/30 flex flex-col justify-center">
          <h3 className="text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-[#707977] mb-2">Total Submissions</h3>
          <p className="text-3xl font-black text-[#12423f] m-0">{totalSubmissions}</p>
        </div>
        <div className="bg-[#f0ede9] p-6 rounded-2xl border border-[#c0c8c6]/30 flex flex-col justify-center">
          <h3 className="text-[0.6875rem] font-bold uppercase tracking-[0.1em] text-[#707977] mb-2">Avg. Performance</h3>
          <p className="text-3xl font-black text-[#12423f] m-0">{avgScoreAll}%</p>
        </div>
      </div>

      {/* ═══ Filters & Search ═══ */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#707977]">
            <IconSearch />
          </div>
          <input
            type="text"
            placeholder="Search assignments by title..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#f0ede9] border border-[#c0c8c6]/30 rounded-xl text-sm focus:ring-2 focus:ring-[#12423f]/20 focus:border-[#12423f] outline-none transition-all"
          />
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="appearance-none pl-9 pr-8 py-2.5 bg-[#f0ede9] border border-[#c0c8c6]/30 rounded-xl text-sm focus:border-[#12423f] outline-none cursor-pointer"
            >
              <option value="all">All Classes</option>
              {distinctClasses.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#707977] pointer-events-none">
              <IconFilter />
            </div>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="pl-4 pr-8 py-2.5 bg-[#f0ede9] border border-[#c0c8c6]/30 rounded-xl text-sm focus:border-[#12423f] outline-none cursor-pointer"
          >
            <option value="all">All Status</option>
            <option value="PUBLISHED">Published</option>
            <option value="DRAFT">Draft</option>
            <option value="CLOSED">Closed</option>
          </select>
        </div>
      </div>

      {/* ═══ Assignments Table ═══ */}
      <div className="bg-[#f0ede9] rounded-2xl border border-[#c0c8c6]/30 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-sm">
            <thead>
              <tr className="border-b border-[#c0c8c6]/30">
                {[
                  { label: "Assignment", key: "title" },
                  { label: "Class", key: "className" },
                  { label: "Status", key: null },
                  { label: "Submissions", key: "submissionCount" },
                  { label: "Avg. Score", key: "averageScore" },
                  { label: "Due Date", key: "dueDate" },
                  { label: "Action", key: null }
                ].map((col, i) => (
                  <th
                    key={i}
                    className={`px-6 py-4 text-[0.6rem] font-black uppercase tracking-[0.1em] text-[#404847] ${col.key ? 'cursor-pointer hover:text-[#12423f] transition-colors' : ''} ${i === 6 ? "text-right" : "text-left"}`}
                    onClick={() => col.key && handleSort(col.key as SortKey)}
                  >
                    <div className={`flex items-center gap-2 ${i === 6 ? 'justify-end' : ''}`}>
                      {col.label}
                      {col.key && <IconSort active={sortConfig.key === col.key} direction={sortConfig.direction} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#c0c8c6]/10">
              {filteredAndSorted.map((a) => {
                const pct = Math.min(Math.round((a.submissionCount / 45) * 100), 100);
                const dueDate = a.dueDate ? new Date(a.dueDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }) : 'No date';
                
                return (
                  <tr key={a.id} className="transition-colors hover:bg-[#e5e2de]">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-[#1c1c1a] m-0 text-sm leading-snug">{a.title}</p>
                      <p className="text-[0.625rem] text-[#707977] m-0 mt-0.5">Code: {a.code}</p>
                    </td>
                    <td className="px-6 py-4 text-[#404847] text-sm">
                      {a.className || "Unassigned"}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[0.6rem] font-bold uppercase tracking-wider border ${getStatusColor(a.status)}`}>
                        {a.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#1c1c1a] text-sm">{a.submissionCount}</span>
                        <div className="w-16 h-1 bg-[#c0c8c6]/30 rounded-full overflow-hidden hidden sm:block">
                          <div className="h-full rounded-full bg-[#12423f] transition-all duration-300" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-semibold text-[#12423f] text-sm">
                      {a.averageScore}
                      <span className="font-normal text-[#707977]"> / {a.totalMarks}</span>
                    </td>
                    <td className="px-6 py-4 text-[#404847] text-xs">
                      {dueDate}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/teacher/assignments/${a.id}`} className="text-[0.6875rem] font-bold text-[#12423f] uppercase tracking-[0.05em] no-underline inline-flex items-center gap-1">
                        View Report <IconChevronRight />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredAndSorted.length === 0 && (
            <div className="p-12 text-center text-[#707977] text-sm font-medium">
              No assignments match your filters.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
