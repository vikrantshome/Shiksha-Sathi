"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import { ClassItem, User } from "@/lib/api/types";

const statusMeta = {
  PRESENT: {
    label: "Present",
    background: "rgba(45, 106, 79, 0.12)",
    color: "var(--color-success)",
  },
  ABSENT: {
    label: "Absent",
    background: "rgba(168, 56, 54, 0.12)",
    color: "var(--color-error)",
  },
  LATE: {
    label: "Late",
    background: "rgba(180, 83, 9, 0.12)",
    color: "var(--color-warning)",
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

  if (loading) {
    return (
      <div
        style={{
          minHeight: "24rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: "var(--space-4)",
        }}
      >
        <div
          style={{
            width: "3rem",
            height: "3rem",
            borderRadius: "50%",
            border: "2px solid rgba(68, 99, 113, 0.18)",
            borderTopColor: "var(--color-primary)",
          }}
          className="attendance-spinner"
        />
        <p style={{ color: "var(--color-on-surface-variant)", margin: 0 }}>
          Preparing the attendance register…
        </p>
        <style>{`
          .attendance-spinner {
            animation: attendance-spin 0.9s linear infinite;
          }
          @keyframes attendance-spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!classData) {
    return <div>Class not found</div>;
  }

  return (
    <div style={{ paddingBottom: "var(--space-10)" }}>
      <div style={{ marginBottom: "var(--space-8)" }}>
        <nav
          style={{
            display: "flex",
            alignItems: "center",
            gap: "var(--space-2)",
            fontSize: "0.75rem",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--color-on-surface-variant)",
            marginBottom: "var(--space-3)",
          }}
        >
          <Link
            href="/teacher/classes"
            style={{ color: "var(--color-primary)", textDecoration: "none" }}
          >
            Classes
          </Link>
          <span>/</span>
          <span>{classData.name}</span>
        </nav>

        <div className="attendance-header-grid">
          <div>
            <h1
              style={{
                fontFamily: "var(--font-manrope), system-ui, sans-serif",
                fontSize: "clamp(2rem, 4vw, 2.5rem)",
                fontWeight: 800,
                letterSpacing: "-0.03em",
                color: "var(--color-primary)",
                margin: 0,
              }}
            >
              Attendance Register
            </h1>
            <p
              style={{
                fontSize: "0.9375rem",
                color: "var(--color-on-surface-variant)",
                lineHeight: 1.7,
                margin: "var(--space-3) 0 0",
                maxWidth: "32rem",
              }}
            >
              {classData.name} • Section {classData.section} • {students.length} students
            </p>
          </div>

          <div
            style={{
              background: "var(--color-surface-container-lowest)",
              borderRadius: "var(--radius-lg)",
              padding: "var(--space-4)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <label
              htmlFor="attendance-date"
              style={{
                display: "block",
                fontSize: "0.6875rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--color-on-surface-variant)",
                marginBottom: "var(--space-2)",
              }}
            >
              Register Date
            </label>
            <input
              id="attendance-date"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={{
                width: "100%",
                background: "var(--color-surface-container-low)",
                border: "none",
                borderBottom: "1px solid var(--color-outline-variant)",
                padding: "var(--space-2) 0",
                fontSize: "0.9375rem",
                color: "var(--color-on-surface)",
                outline: "none",
              }}
            />
          </div>
        </div>
      </div>

      <section
        className="attendance-summary-grid"
        style={{
          display: "grid",
          gap: "var(--space-4)",
          marginBottom: "var(--space-8)",
        }}
      >
        {([
          ["Present", summary.present, statusMeta.PRESENT],
          ["Absent", summary.absent, statusMeta.ABSENT],
          ["Late", summary.late, statusMeta.LATE],
        ] as const).map(([title, value, meta]) => (
          <div
            key={title}
            style={{
              background: "var(--color-surface-container-lowest)",
              borderRadius: "var(--radius-lg)",
              padding: "var(--space-5)",
              boxShadow: "var(--shadow-sm)",
            }}
          >
            <p
              style={{
                fontSize: "0.6875rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--color-on-surface-variant)",
                margin: 0,
              }}
            >
              {title}
            </p>
            <p
              style={{
                fontFamily: "var(--font-manrope), system-ui, sans-serif",
                fontSize: "1.75rem",
                fontWeight: 700,
                color: meta.color,
                margin: "var(--space-2) 0 0",
              }}
            >
              {value}
            </p>
          </div>
        ))}
      </section>

      <section
        style={{
          background: "var(--color-surface-container-lowest)",
          borderRadius: "var(--radius-lg)",
          boxShadow: "var(--shadow-sm)",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "var(--space-4)",
            padding: "var(--space-5) var(--space-6)",
            background: "var(--color-surface-container-low)",
          }}
        >
          <div>
            <p
              style={{
                fontSize: "0.6875rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "var(--color-on-surface-variant)",
                margin: 0,
              }}
            >
              Daily Register
            </p>
            <h2
              style={{
                fontSize: "1.125rem",
                fontWeight: 700,
                color: "var(--color-on-surface)",
                margin: "var(--space-1) 0 0",
              }}
            >
              Student Roster
            </h2>
          </div>
          <span
            style={{
              fontSize: "0.75rem",
              color: "var(--color-on-surface-variant)",
            }}
          >
            Mark each student as present, absent, or late.
          </span>
        </div>

        <div className="attendance-table-wrapper">
          <table className="attendance-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => {
                const currentStatus = attendance[student.id] as AttendanceStatus | undefined;
                return (
                  <tr key={student.id}>
                    <td>
                      <div className="attendance-student-cell">
                        <div className="attendance-avatar">{student.name.charAt(0)}</div>
                        <div>
                          <p className="attendance-student-name">{student.name}</p>
                          <p className="attendance-student-meta">{student.email}</p>
                        </div>
                        {saving === student.id ? (
                          <span className="attendance-saving">Saving…</span>
                        ) : null}
                      </div>
                    </td>
                    <td>
                      <div className="attendance-actions">
                        {(Object.keys(statusMeta) as AttendanceStatus[]).map((status) => {
                          const meta = statusMeta[status];
                          const active = currentStatus === status;
                          return (
                            <button
                              key={status}
                              type="button"
                              onClick={() => handleStatusChange(student.id, status)}
                              style={{
                                background: active
                                  ? meta.color
                                  : meta.background,
                                color: active ? "var(--color-on-primary)" : meta.color,
                              }}
                              className="attendance-chip"
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

        <div className="attendance-card-list">
          {students.map((student) => {
            const currentStatus = attendance[student.id] as AttendanceStatus | undefined;
            return (
              <article key={student.id} className="attendance-mobile-card">
                <div className="attendance-student-cell">
                  <div className="attendance-avatar">{student.name.charAt(0)}</div>
                  <div>
                    <p className="attendance-student-name">{student.name}</p>
                    <p className="attendance-student-meta">{student.email}</p>
                  </div>
                  {saving === student.id ? (
                    <span className="attendance-saving">Saving…</span>
                  ) : null}
                </div>
                <div className="attendance-actions">
                  {(Object.keys(statusMeta) as AttendanceStatus[]).map((status) => {
                    const meta = statusMeta[status];
                    const active = currentStatus === status;
                    return (
                      <button
                        key={status}
                        type="button"
                        onClick={() => handleStatusChange(student.id, status)}
                        style={{
                          background: active ? meta.color : meta.background,
                          color: active ? "var(--color-on-primary)" : meta.color,
                        }}
                        className="attendance-chip"
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

      <style>{`
        .attendance-header-grid {
          display: grid;
          gap: var(--space-6);
        }
        .attendance-summary-grid {
          grid-template-columns: repeat(1, minmax(0, 1fr));
        }
        .attendance-table-wrapper {
          display: none;
        }
        .attendance-card-list {
          display: grid;
          gap: var(--space-4);
          padding: var(--space-5);
        }
        .attendance-mobile-card {
          display: grid;
          gap: var(--space-4);
          padding-bottom: var(--space-4);
          border-bottom: 1px solid rgba(176, 179, 173, 0.15);
        }
        .attendance-mobile-card:last-child {
          border-bottom: none;
          padding-bottom: 0;
        }
        .attendance-table {
          width: 100%;
          border-collapse: collapse;
        }
        .attendance-table th {
          text-align: left;
          padding: var(--space-4) var(--space-6);
          font-size: 0.6875rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--color-on-surface-variant);
          font-weight: 700;
          background: rgba(244, 244, 239, 0.5);
        }
        .attendance-table td {
          padding: var(--space-5) var(--space-6);
          vertical-align: top;
          border-top: 1px solid rgba(176, 179, 173, 0.12);
        }
        .attendance-student-cell {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          flex-wrap: wrap;
        }
        .attendance-avatar {
          width: 2.5rem;
          height: 2.5rem;
          border-radius: 9999px;
          background: var(--color-secondary-container);
          color: var(--color-on-primary-container);
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .attendance-student-name {
          margin: 0;
          font-size: 0.9375rem;
          font-weight: 600;
          color: var(--color-on-surface);
        }
        .attendance-student-meta {
          margin: var(--space-1) 0 0;
          font-size: 0.75rem;
          color: var(--color-on-surface-variant);
        }
        .attendance-saving {
          font-size: 0.6875rem;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--color-primary);
          margin-left: auto;
        }
        .attendance-actions {
          display: flex;
          flex-wrap: wrap;
          gap: var(--space-2);
        }
        .attendance-chip {
          border: none;
          border-radius: 9999px;
          padding: var(--space-2) var(--space-4);
          font-size: 0.75rem;
          font-weight: 700;
          cursor: pointer;
          transition: transform 120ms ease-out, opacity 120ms ease-out;
        }
        .attendance-chip:hover {
          opacity: 0.92;
          transform: translateY(-1px);
        }
        .attendance-chip:active {
          transform: scale(0.98);
        }
        @media (min-width: 768px) {
          .attendance-header-grid {
            grid-template-columns: 1.5fr minmax(15rem, 18rem);
            align-items: end;
          }
          .attendance-summary-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
          .attendance-table-wrapper {
            display: block;
          }
          .attendance-card-list {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
