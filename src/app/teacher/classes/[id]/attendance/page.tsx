"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { ClassItem, User } from "@/lib/api/types";
import Loader from "@/components/Loader";

/* ─────────────────────────────────────────────────────────
   Attendance Register — SSA-252 Tailwind Migration
   Canonical export: attendance_register_shiksha_sathi
   Design System: design-system.md ("Digital Atelier")
   ───────────────────────────────────────────────────────── */

const statusMeta = {
  PRESENT: {
    label: "Present",
    bg: "bg-[var(--color-success)]/15",
    bgActive: "bg-[var(--color-success)]",
    text: "text-[var(--color-success)]",
  },
  ABSENT: {
    label: "Absent",
    bg: "bg-[var(--color-error)]/15",
    bgActive: "bg-[var(--color-error)]",
    text: "text-[var(--color-error)]",
  },
  LATE: {
    label: "Late",
    bg: "bg-[var(--color-warning)]/15",
    bgActive: "bg-[var(--color-warning)]",
    text: "text-[var(--color-warning)]",
  },
} as const;

type AttendanceStatus = keyof typeof statusMeta;

export default function AttendancePage() {
  const { id } = useParams() as { id: string };
  const [classData, setClassData] = useState<ClassItem | null>(null);
  const [students, setStudents] = useState<User[]>([]);
  const [attendance, setAttendance] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const [cls, stds, records] = await Promise.all([
          api.classes.getClass(id),
          api.classes.getStudents(id),
          api.classes.getAttendance(id, date),
        ]);

        setClassData(cls);
        setStudents(stds);

        const nextAttendance: Record<string, string> = {};
        records.forEach((record) => {
          nextAttendance[record.studentId] = record.status;
        });
        setAttendance(nextAttendance);
      } catch (error) {
        console.error("Failed to load attendance data:", error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [date, id]);

  const summary = useMemo(() => {
    return students.reduce(
      (acc, student) => {
        const current = attendance[student.id] as AttendanceStatus | undefined;
        if (current === "PRESENT") acc.present += 1;
        if (current === "ABSENT") acc.absent += 1;
        if (current === "LATE") acc.late += 1;
        return acc;
      },
      { present: 0, absent: 0, late: 0 }
    );
  }, [attendance, students]);

  const handleStatusChange = async (
    studentId: string,
    status: AttendanceStatus
  ) => {
    setSaving(studentId);
    try {
      await api.classes.markAttendance(id, studentId, date, status);
      setAttendance((prev) => ({ ...prev, [studentId]: status }));
    } catch (error) {
      console.error("Failed to mark attendance:", error);
    } finally {
      setSaving(null);
    }
  };

  const handleBulkAttendance = async (status: AttendanceStatus) => {
    try {
      await api.classes.markBulkAttendance(id, date, status);
      const next: Record<string, string> = {};
      students.forEach(s => { next[s.id] = status; });
      setAttendance(next);
    } catch (error) {
      console.error("Failed to mark bulk attendance:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-96 flex items-center justify-center flex-col gap-4">
        <Loader size="lg" label="Preparing the attendance register…" />
      </div>
    );
  }

  if (!classData) {
    return <div>Class not found</div>;
  }

  return (
    <div className="pb-6">
      {/* ── Header ── */}
      <div className="mb-4">
        <nav className="flex items-center gap-2 text-[10px] uppercase tracking-[0.08em] text-on-surface-variant mb-2">
          <Link href="/teacher/classes" className="text-primary no-underline">
            Classes
          </Link>
          <span>/</span>
          <span>{classData.name}</span>
        </nav>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-manrope text-2xl font-bold tracking-[-0.03em] text-primary m-0">
              Attendance
            </h1>
            <p className="text-xs text-on-surface-variant mt-1">
              {classData.name} • {students.length} students
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-surface-container-lowest rounded-lg px-3 py-1.5 shadow-sm">
              <input
                id="attendance-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="bg-transparent border-0 text-sm text-on-surface outline-none"
              />
            </div>
            <Link
              href={`/teacher/classes/${id}/attendance/history`}
              className="text-[10px] font-medium text-primary hover:text-primary-dim no-underline"
            >
              History →
            </Link>
          </div>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <section className="grid grid-cols-3 gap-2 mb-4">
        {([
          ["Present", summary.present, statusMeta.PRESENT] as const,
          ["Absent", summary.absent, statusMeta.ABSENT] as const,
          ["Late", summary.late, statusMeta.LATE] as const,
        ]).map(([title, value, meta]) => (
          <div
            key={title}
            className="bg-surface-container-lowest rounded-lg p-3 shadow-sm"
          >
            <p className="text-[0.5625rem] font-bold uppercase tracking-[0.08em] text-on-surface-variant m-0">
              {title}
            </p>
            <p className={`font-manrope text-xl font-bold mt-0.5 m-0 ${meta.text}`}>
              {value}
            </p>
          </div>
        ))}
      </section>

      {/* ── Student Roster ── */}
      <section className="bg-surface-container-lowest rounded-lg shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="flex items-center justify-between gap-3 p-3 px-4 bg-surface-container-low">
          <div>
            <p className="text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-on-surface-variant m-0">
              Daily Register
            </p>
            <h2 className="text-[1rem] font-bold text-on-surface mt-0.5">
              Student Roster
            </h2>
          </div>
          <span className="text-[10px] text-on-surface-variant hidden sm:block">
            Mark each student as present, absent, or late.
          </span>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left p-2 px-4 text-[0.625rem] tracking-[0.08em] uppercase text-on-surface-variant font-bold bg-[rgba(244,244,239,0.5)]">
                  Student
                </th>
                <th className="text-left p-2 px-4 text-[0.625rem] tracking-[0.08em] uppercase text-on-surface-variant font-bold bg-[rgba(244,244,239,0.5)]">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const currentStatus = attendance[student.id] as AttendanceStatus | undefined;
                return (
                  <tr key={student.id} className="border-t border-outline/10">
                    <td className="p-2 px-4 align-middle">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-secondary-container text-on-primary-container font-bold flex items-center justify-center shrink-0 text-xs">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <p className="m-0 text-sm font-semibold text-on-surface">
                            {student.name}
                          </p>
                        </div>
                        {saving === student.id && (
                          <span className="text-[0.5625rem] font-bold tracking-[0.08em] uppercase text-primary ml-1">
                            Saving…
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-2 px-4 align-middle">
                      <div className="flex gap-1">
                        {(Object.keys(statusMeta) as AttendanceStatus[]).map((status) => {
                          const meta = statusMeta[status];
                          const active = currentStatus === status;
                          return (
                            <button
                              key={status}
                              type="button"
                              onClick={() => handleStatusChange(student.id, status)}
                              className={`border-none rounded-full py-1 px-2.5 text-[10px] font-semibold cursor-pointer transition-all duration-150 ease-out ${
                                active
                                  ? `${meta.bgActive} text-white`
                                  : `${meta.bg} ${meta.text}`
                              }`}
                            >
                              {meta.label}
                            </button>
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile Card Fallback */}
        <div className="grid gap-2 p-3 md:hidden">
          {students.map((student) => {
            const currentStatus = attendance[student.id] as AttendanceStatus | undefined;
            return (
              <article
                key={student.id}
                className="flex items-center justify-between gap-2 py-2 border-b border-outline/10 last:border-b-0"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-secondary-container text-on-primary-container font-bold flex items-center justify-center shrink-0 text-xs">
                    {student.name.charAt(0)}
                  </div>
                  <p className="m-0 text-sm font-medium text-on-surface">
                    {student.name}
                  </p>
                </div>
                <div className="flex gap-1">
                  {(Object.keys(statusMeta) as AttendanceStatus[]).map((status) => {
                    const meta = statusMeta[status];
                    const active = currentStatus === status;
                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => handleStatusChange(student.id, status)}
                        className={`border-none rounded-full py-1 px-2 text-[9px] font-semibold cursor-pointer ${
                          active
                            ? `${meta.bgActive} text-white`
                            : `${meta.bg} ${meta.text}`
                        }`}
                      >
                        {meta.label}
                      </button>
                    );
                  })}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
