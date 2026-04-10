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
  const [students, setStudents] = useState<{ id: string; name: string }[]>([]);

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
    const headers = ["Student Name", "Student ID", ...dates];
    const rows = students.map(student => {
      const studentRecords = records.filter(r => r.studentId === student.id);
      const statusMap: Record<string, string> = {};
      studentRecords.forEach(r => { statusMap[r.date] = r.status; });
      return [student.name, student.id, ...dates.map(d => statusMap[d] || "—")];
    });

    const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-${classData.name}-${startDate}-to-${endDate}.csv`;
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
          <Link href="/teacher/classes" className="text-primary no-underline">Classes</Link>
          <span>/</span>
          <Link href={`/teacher/classes/${id}/attendance`} className="text-primary no-underline">{classData.name}</Link>
          <span>/</span>
          <span>History</span>
        </nav>

        <div className="flex items-end justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-manrope text-[clamp(2rem,4vw,2.5rem)] font-extrabold tracking-[-0.03em] text-primary m-0">
              Attendance History
            </h1>
            <p className="text-[0.9375rem] text-on-surface-variant mt-2">
              {classData.name} • {students.length} students • {attendancePercent}% attendance rate
            </p>
          </div>
          <button
            onClick={handleExportCSV}
            disabled={records.length === 0}
            className="px-4 py-2 bg-primary text-on-primary text-sm font-medium rounded-sm disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
          >
            Export CSV
          </button>
        </div>
      </div>

      {/* Date Range Picker */}
      <div className="bg-surface-container-low rounded-lg p-4 mb-6 flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-on-surface-variant mb-2">
            Start Date
          </label>
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="bg-surface-container-lowest border border-outline-variant rounded-sm py-2 px-3 text-on-surface outline-none focus:border-primary"
          />
        </div>
        <div>
          <label className="block text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-on-surface-variant mb-2">
            End Date
          </label>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="bg-surface-container-lowest border border-outline-variant rounded-sm py-2 px-3 text-on-surface outline-none focus:border-primary"
          />
        </div>
        <div className="text-sm text-on-surface-variant">
          {dates.length} days • {records.length} records
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
