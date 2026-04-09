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
    bg: "bg-[rgba(45,106,79,0.12)]",
    bgActive: "bg-[#2d6a4f]",
    text: "text-[var(--color-success)]",
  },
  ABSENT: {
    label: "Absent",
    bg: "bg-[rgba(168,56,54,0.12)]",
    bgActive: "bg-[#a83836]",
    text: "text-[var(--color-error)]",
  },
  LATE: {
    label: "Late",
    bg: "bg-[rgba(180,83,9,0.12)]",
    bgActive: "bg-[#b45309]",
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
    <div className="pb-8 md:pb-10">
      {/* ── Header ── */}
      <div className="mb-6 md:mb-8">
        <nav className="flex items-center gap-2 text-xs uppercase tracking-[0.08em] text-on-surface-variant mb-2 md:mb-3">
          <Link href="/teacher/classes" className="text-primary no-underline">
            Classes
          </Link>
          <span>/</span>
          <span>{classData.name}</span>
        </nav>

        <div className="grid gap-4 md:gap-6 md:grid-cols-[1.5fr_minmax(15rem,18rem)] md:items-end">
          <div>
            <h1 className="font-manrope text-[clamp(2rem,4vw,2.5rem)] font-extrabold tracking-[-0.03em] text-primary m-0">
              Attendance Register
            </h1>
            <p className="text-[0.9375rem] text-on-surface-variant leading-[1.7] mt-2 md:mt-3 max-w-[32rem]">
              {classData.name} • Section {classData.section} • {students.length} students
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <div className="bg-surface-container-lowest rounded-lg p-3 md:p-4 shadow-sm">
              <label
                htmlFor="attendance-date"
                className="block text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-on-surface-variant mb-2"
              >
                Register Date
              </label>
              <input
                id="attendance-date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-surface-container-low border-0 border-b border-outline-variant py-2 text-[0.9375rem] text-on-surface outline-none focus:border-primary transition-colors"
              />
            </div>
            <Link
              href={`/teacher/classes/${id}/attendance/history`}
              className="text-center text-xs font-medium text-primary hover:text-primary-dim no-underline"
            >
              View History →
            </Link>
          </div>
        </div>
      </div>

      {/* ── Summary Cards ── */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 mb-6 md:mb-8">
        {([
          ["Present", summary.present, statusMeta.PRESENT] as const,
          ["Absent", summary.absent, statusMeta.ABSENT] as const,
          ["Late", summary.late, statusMeta.LATE] as const,
        ]).map(([title, value, meta]) => (
          <div
            key={title}
            className="bg-surface-container-lowest rounded-lg p-4 md:p-5 shadow-sm"
          >
            <p className="text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-on-surface-variant m-0">
              {title}
            </p>
            <p className={`font-manrope text-[1.5rem] md:text-[1.75rem] font-bold mt-1 md:mt-2 m-0 ${meta.text}`}>
              {value}
            </p>
          </div>
        ))}
      </section>

      {/* ── Student Roster ── */}
      <section className="bg-surface-container-lowest rounded-lg shadow-sm overflow-hidden">
        {/* Table Header */}
        <div className="flex items-center justify-between gap-3 md:gap-4 p-4 px-4 md:p-5 md:px-6 bg-surface-container-low">
          <div>
            <p className="text-[0.6875rem] font-bold uppercase tracking-[0.08em] text-on-surface-variant m-0">
              Daily Register
            </p>
            <h2 className="text-[1.125rem] font-bold text-on-surface mt-1">
              Student Roster
            </h2>
          </div>
          <span className="text-xs text-on-surface-variant hidden sm:block">
            Mark each student as present, absent, or late.
          </span>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="text-left p-3 md:p-4 px-4 md:px-6 text-[0.6875rem] tracking-[0.08em] uppercase text-on-surface-variant font-bold bg-[rgba(244,244,239,0.5)]">
                  Student
                </th>
                <th className="text-left p-3 md:p-4 px-4 md:px-6 text-[0.6875rem] tracking-[0.08em] uppercase text-on-surface-variant font-bold bg-[rgba(244,244,239,0.5)]">
                  Status
                </th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const currentStatus = attendance[student.id] as AttendanceStatus | undefined;
                return (
                  <tr key={student.id} className="border-t border-outline/10">
                    <td className="p-4 md:p-5 px-4 md:px-6 align-top">
                      <div className="flex items-center gap-3 md:gap-4 flex-wrap">
                        <div className="w-9 h-9 md:w-10 md:h-10 rounded-full bg-secondary-container text-on-primary-container font-bold flex items-center justify-center shrink-0">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <p className="m-0 text-[0.9375rem] font-semibold text-on-surface">
                            {student.name}
                          </p>
                          <p className="m-0 mt-1 text-xs text-on-surface-variant">
                            {student.email}
                          </p>
                        </div>
                        {saving === student.id && (
                          <span className="text-[0.6875rem] font-bold tracking-[0.08em] uppercase text-primary ml-auto">
                            Saving…
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-5 px-6 align-top">
                      <div className="flex flex-wrap gap-2">
                        {(Object.keys(statusMeta) as AttendanceStatus[]).map((status) => {
                          const meta = statusMeta[status];
                          const active = currentStatus === status;
                          return (
                            <button
                              key={status}
                              type="button"
                              onClick={() => handleStatusChange(student.id, status)}
                              className={`border-none rounded-full py-2 px-4 text-xs font-bold cursor-pointer transition-all duration-150 ease-out hover:opacity-90 hover:-translate-y-px active:scale-[0.98] ${
                                active
                                  ? `${meta.bgActive} text-on-primary`
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
        <div className="grid gap-4 p-5 md:hidden">
          {students.map((student) => {
            const currentStatus = attendance[student.id] as AttendanceStatus | undefined;
            return (
              <article
                key={student.id}
                className="grid gap-4 pb-4 border-b border-outline/15 last:border-b-0 last:pb-0"
              >
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="w-10 h-10 rounded-full bg-secondary-container text-on-primary-container font-bold flex items-center justify-center shrink-0">
                    {student.name.charAt(0)}
                  </div>
                  <div>
                    <p className="m-0 text-[0.9375rem] font-semibold text-on-surface">
                      {student.name}
                    </p>
                    <p className="m-0 mt-1 text-xs text-on-surface-variant">
                      {student.email}
                    </p>
                  </div>
                  {saving === student.id && (
                    <span className="text-[0.6875rem] font-bold tracking-[0.08em] uppercase text-primary ml-auto">
                      Saving…
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-2">
                  {(Object.keys(statusMeta) as AttendanceStatus[]).map((status) => {
                    const meta = statusMeta[status];
                    const active = currentStatus === status;
                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => handleStatusChange(student.id, status)}
                        className={`border-none rounded-full py-2 px-4 text-xs font-bold cursor-pointer transition-all duration-150 ease-out hover:opacity-90 hover:-translate-y-px active:scale-[0.98] ${
                          active
                            ? `${meta.bgActive} text-on-primary`
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
