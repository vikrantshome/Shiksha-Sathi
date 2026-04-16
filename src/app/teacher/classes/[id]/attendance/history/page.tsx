"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { ClassItem, AttendanceRecord } from "@/lib/api/types";
import Loader from "@/components/Loader";

const statusLabels: Record<string, string> = {
  PRESENT: "Present",
  ABSENT: "Absent",
  LATE: "Late",
  EXCUSED: "Excused",
};

const statusColors: Record<string, string> = {
  PRESENT: "bg-[var(--color-success)] text-white",
  ABSENT: "bg-[var(--color-error)] text-white",
  LATE: "bg-[var(--color-warning)] text-white",
  EXCUSED: "bg-[var(--color-outline)] text-white",
};

export default function AttendanceHistoryPage() {
  const { id } = useParams() as { id: string };
  const [classData, setClassData] = useState<ClassItem | null>(null);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [students, setStudents] = useState<{ id: string; name: string; rollNumber?: string }[]>([]);

  // Default: last 7 days
  const today = new Date();
  const weekAgo = new Date();
  weekAgo.setDate(today.getDate() - 7);

  const [startDate, setStartDate] = useState(weekAgo.toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState(today.toISOString().split("T")[0]);

  useEffect(() => {
    async function loadClass() {
      try {
        const cls = await api.classes.getClass(id);
        setClassData(cls);
      } catch (error) {
        console.error("Failed to load class:", error);
      }
    }
    loadClass();
  }, [id]);

  useEffect(() => {
    async function loadHistory() {
      if (!startDate || !endDate) return;
      setLoading(true);
      try {
        const [history, stds] = await Promise.all([
          api.classes.getAttendanceHistory(id, startDate, endDate),
          api.classes.getStudents(id),
        ]);
        setRecords(history);
        setStudents(stds);
      } catch (error) {
        console.error("Failed to load history:", error);
      } finally {
        setLoading(false);
      }
    }
    loadHistory();
  }, [id, startDate, endDate]);

  const handleExportCSV = () => {
    if (!classData || records.length === 0) return;

    // Build CSV
    const dates = [...new Set(records.map(r => r.date))].sort();
    const headers = ["Roll No", "Student Name", ...dates];
    const rows = students.map(student => {
      const studentRecords = records.filter(r => r.studentId === student.id);
      const statusMap: Record<string, string> = {};
      studentRecords.forEach(r => { statusMap[r.date] = r.status; });
      return [student.rollNumber || "—", student.name, ...dates.map(d => statusMap[d] || "—")];
    });

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${classData.name}_${classData.grade}_${classData.section}_attendance_${startDate}_to_${endDate}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!classData) return <div>Loading...</div>;

  // Build attendance matrix
  const dates = [...new Set(records.map(r => r.date))].sort();
  const studentMap = new Map<string, Map<string, string>>();
  records.forEach(r => {
    if (!studentMap.has(r.studentId)) studentMap.set(r.studentId, new Map());
    studentMap.get(r.studentId)!.set(r.date, r.status);
  });

  const attendancePercent = records.length > 0
    ? Math.round((records.filter(r => r.status === "PRESENT" || r.status === "LATE").length / records.length) * 100)
    : 0;

  return (
    <div className="pb-8 md:pb-10">
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <nav className="flex items-center gap-2 text-xs uppercase tracking-[0.08em] text-on-surface-variant mb-2 md:mb-3">
          <Link href="/teacher/classes" className="text-primary no-underline hover:underline">Classes</Link>
          <span className="text-on-surface-variant/50">/</span>
          <Link href={`/teacher/classes/${id}/attendance`} className="text-primary no-underline hover:underline">{classData.name}</Link>
          <span className="text-on-surface-variant/50">/</span>
          <span className="text-on-surface">History</span>
        </nav>

        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-manrope text-[clamp(1.75rem,3.5vw,2.25rem)] font-extrabold tracking[-0.02em] text-primary m-0">
              Attendance History
            </h1>
            <div className="flex items-center gap-3 mt-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-low rounded-md text-sm font-medium text-on-surface">
                <span className="text-[#12423f]">{classData.name}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-low rounded-md text-sm font-medium text-on-surface">
                <span className="text-on-surface-variant">Students:</span>
                <span className="text-[#12423f] font-semibold">{students.length}</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-low rounded-md text-sm font-medium text-on-surface">
                <span className="text-on-surface-variant">Attendance:</span>
                <span className={`font-semibold ${attendancePercent >= 75 ? 'text-emerald-600' : attendancePercent >= 50 ? 'text-amber-600' : 'text-rose-600'}`}>
                  {attendancePercent}%
                </span>
              </span>
            </div>
          </div>
          <button
            onClick={handleExportCSV}
            disabled={records.length === 0}
            className="px-5 py-2.5 bg-[#12423f] text-white text-sm font-semibold rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#0d3632] active:scale-[0.98] transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      {/* Date Range Picker */}
      <div className="bg-surface-container-low rounded-xl p-5 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-on-surface-variant mb-2">
              Start Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline/20 rounded-lg py-2.5 px-4 text-on-surface text-sm outline-none focus:border-[#12423f] focus:ring-1 focus:ring-[#12423f]/20 transition-all"
              />
            </div>
          </div>
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-surface-container-lowest">
            <svg className="w-4 h-4 text-on-surface-variant" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="block text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-on-surface-variant mb-2">
              End Date
            </label>
            <div className="relative">
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline/20 rounded-lg py-2.5 px-4 text-on-surface text-sm outline-none focus:border-[#12423f] focus:ring-1 focus:ring-[#12423f]/20 transition-all"
              />
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2.5 bg-surface-container-lowest rounded-lg border border-outline/10">
            <svg className="w-5 h-5 text-on-surface-variant" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm font-medium text-on-surface">
              <span className="text-[#12423f] font-semibold">{dates.length}</span>
              <span className="text-on-surface-variant mx-1">days</span>
              <span className="text-on-surface-variant/50">•</span>
              <span className="text-on-surface-variant mx-1">{records.length}</span>
              <span className="text-on-surface-variant">records</span>
            </span>
          </div>
        </div>
      </div>

      {/* Attendance Matrix */}
      {loading ? (
        <div className="min-h-48 flex items-center justify-center">
          <Loader size="md" label="Loading attendance history…" />
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-12 bg-surface-container-lowest rounded-lg border border-dashed border-outline-variant">
          <p className="text-lg font-semibold text-on-surface">No attendance records found</p>
          <p className="text-sm text-on-surface-variant mt-2">Mark attendance for at least one day to see history.</p>
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-lg shadow-sm overflow-x-auto">
          <table className="w-full border-collapse min-w-[600px]">
            <thead>
              <tr>
                <th className="text-left p-3 px-4 text-[0.6875rem] tracking-[0.08em] uppercase text-on-surface-variant font-bold bg-surface-container-low sticky left-0 z-10">
                  Student
                </th>
                {dates.map(date => (
                  <th key={date} className="p-3 text-center text-[0.6875rem] text-on-surface-variant font-bold bg-surface-container-low whitespace-nowrap">
                    {new Date(date + "T00:00:00+05:30").toLocaleDateString("en-IN", { day: "numeric", month: "short", timeZone: "Asia/Kolkata" })}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.id} className="border-t border-outline/10">
                  <td className="p-3 px-4 text-sm font-medium text-on-surface sticky left-0 bg-surface-container-lowest z-10">
                    {student.name}
                  </td>
                  {dates.map(date => {
                    const status = studentMap.get(student.id)?.get(date);
                    return (
                      <td key={date} className="p-3 text-center">
                        {status ? (
                          <span className={`inline-block px-2 py-1 text-[0.625rem] font-bold rounded-sm ${statusColors[status] || "bg-gray-300 text-gray-700"}`}>
                            {statusLabels[status] || status}
                          </span>
                        ) : (
                          <span className="text-xs text-on-surface-variant/50">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
