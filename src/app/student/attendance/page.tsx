"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { AttendanceRecord } from "@/lib/api/types";
import { getStudentIdentity } from "@/lib/api/students";

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  PRESENT: { label: "Present", color: "text-[var(--color-success)]", bg: "bg-[var(--color-success)]/15" },
  ABSENT: { label: "Absent", color: "text-[var(--color-error)]", bg: "bg-[var(--color-error)]/15" },
  LATE: { label: "Late", color: "text-[var(--color-warning)]", bg: "bg-[var(--color-warning)]/15" },
  EXCUSED: { label: "Excused", color: "text-[var(--color-outline)]", bg: "bg-[var(--color-surface-container)]" },
};

export default function StudentAttendancePage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [studentName, setStudentName] = useState("Student");

  // Current month
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());

  useEffect(() => {
    const identity = getStudentIdentity();
    if (identity) setStudentName(identity.studentName);
  }, []);

  useEffect(() => {
    async function loadAttendance() {
      const identity = getStudentIdentity();
      if (!identity) {
        setLoading(false);
        return;
      }

      setLoading(true);
      const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
      const lastDay = new Date(year, month + 1, 0).getDate();
      const endDate = `${year}-${String(month + 1).padStart(2, "0")}-${lastDay}`;

      try {
        const data = await api.classes.getStudentAttendance(identity.studentId, startDate, endDate);
        setRecords(data);
      } catch {
        setRecords([]);
      } finally {
        setLoading(false);
      }
    }
    loadAttendance();
  }, [month, year]);

  // Build calendar
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayOfWeek = new Date(year, month, 1).getDay();
  const statusByDate = new Map<string, AttendanceRecord>();
  records.forEach(r => statusByDate.set(r.date, r));

  const presentCount = records.filter(r => r.status === "PRESENT").length;
  const absentCount = records.filter(r => r.status === "ABSENT").length;
  const lateCount = records.filter(r => r.status === "LATE").length;
  const attendanceRate = records.length > 0
    ? Math.round(((presentCount + lateCount) / records.length) * 100)
    : 0;

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  return (
    <div className="pb-8 md:pb-10">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-manrope text-[clamp(1.75rem,4vw,2.25rem)] font-extrabold tracking-[-0.03em] text-primary m-0">
          My Attendance
        </h1>
        <p className="text-[0.9375rem] text-on-surface-variant mt-2">
          {studentName} • {monthNames[month]} {year}
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <div className="bg-surface-container-lowest rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-primary">{attendanceRate}%</p>
          <p className="text-xs text-on-surface-variant mt-1">Attendance Rate</p>
        </div>
        <div className="bg-surface-container-lowest rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-[var(--color-success)]">{presentCount}</p>
          <p className="text-xs text-on-surface-variant mt-1">Present</p>
        </div>
        <div className="bg-surface-container-lowest rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-[var(--color-error)]">{absentCount}</p>
          <p className="text-xs text-on-surface-variant mt-1">Absent</p>
        </div>
        <div className="bg-surface-container-lowest rounded-lg p-4 text-center">
          <p className="text-2xl font-bold text-[var(--color-warning)]">{lateCount}</p>
          <p className="text-xs text-on-surface-variant mt-1">Late</p>
        </div>
      </div>

      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => { if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1); }}
          className="px-3 py-2 text-sm font-medium text-primary hover:bg-surface-container rounded-sm"
        >
          ← Prev
        </button>
        <span className="text-lg font-bold text-on-surface">{monthNames[month]} {year}</span>
        <button
          onClick={() => { if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1); }}
          className="px-3 py-2 text-sm font-medium text-primary hover:bg-surface-container rounded-sm"
        >
          Next →
        </button>
      </div>

      {/* Calendar Grid */}
      {loading ? (
        <div className="text-center py-12 text-on-surface-variant">Loading attendance...</div>
      ) : (
        <div className="bg-surface-container-lowest rounded-lg shadow-sm p-4">
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(day => (
              <div key={day} className="text-center text-[0.625rem] font-bold uppercase tracking-[0.08em] text-on-surface-variant py-2">
                {day}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: firstDayOfWeek }).map((_, i) => (
              <div key={`empty-${i}`} />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const record = statusByDate.get(dateStr);
              const config = record ? statusConfig[record.status] : null;

              return (
                <div
                  key={day}
                  className={`aspect-square flex flex-col items-center justify-center rounded-sm text-sm ${
                    config ? `${config.bg} ${config.color} font-bold` : "text-on-surface-variant"
                  }`}
                >
                  <span>{day}</span>
                  {config && <span className="text-[0.5rem] mt-0.5">{config.label.substring(0, 3)}</span>}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="flex flex-wrap gap-4 mt-6 text-xs text-on-surface-variant">
        {Object.entries(statusConfig).map(([key, cfg]) => (
          <div key={key} className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-sm ${cfg.bg}`} />
            <span>{cfg.label}</span>
          </div>
        ))}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-surface-container-lowest border border-outline/20" />
          <span>No Record</span>
        </div>
      </div>
    </div>
  );
}
