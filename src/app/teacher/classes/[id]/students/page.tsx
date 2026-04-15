import { api } from "@/lib/api";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ClassItem, User } from "@/lib/api/types";
import { AcademicCapIcon } from "@heroicons/react/24/outline";
import { enrollStudent, removeStudent } from "./actions";
import EditStudentForm from "./EditStudentForm";
import EnrollForm from "./EnrollForm";

export const dynamic = "force-dynamic";

export default async function ClassStudentsPage(props: { params: Promise<{ id: string }>; searchParams: Promise<{ edit?: string }> }) {
  const { id } = await props.params;
  const searchParams = await props.searchParams;
  const editStudentId = searchParams?.edit;

  let classData: ClassItem | null = null;
  let students: User[] = [];

  try {
    const [cls, stds] = await Promise.all([
      api.classes.getClass(id),
      api.classes.getStudents(id),
    ]);
    classData = cls;
    students = stds;
  } catch (err: unknown) {
    const error = err as { status?: number };
    if (error.status === 401) {
      redirect("/login");
    }
    console.error("Failed to load class details:", err);
  }

  if (!classData) {
    return <div>Class not found</div>;
  }

  const sortedStudents = [...students].sort((a, b) => {
    const rollA = a.rollNumber ? parseInt(a.rollNumber) : 999999;
    const rollB = b.rollNumber ? parseInt(b.rollNumber) : 999999;
    return rollA - rollB;
  });

  const editingStudentId = editStudentId ? (Array.isArray(editStudentId) ? editStudentId[0] : editStudentId) : null;
  const editingStudent = editingStudentId ? sortedStudents.find(s => s.id === editingStudentId) : null;

  async function handleRemoveStudent(formData: FormData) {
    "use server";
    const studentId = formData.get("studentId") as string;
    await removeStudent(id, studentId || "");
    redirect(`/teacher/classes/${id}/students`);
  }

  return (
    <div className="pb-8 md:pb-10">
      {editingStudent && (
        <EditStudentForm
          student={editingStudent}
        />
      )}
      {/* Header */}
      <div className="mb-6 md:mb-8">
        <nav className="flex items-center gap-2 text-xs uppercase tracking-[0.08em] text-on-surface-variant mb-2 md:mb-3">
          <Link href="/teacher/classes" className="text-primary no-underline">
            Classes
          </Link>
          <span>/</span>
          <span>{classData.name}</span>
        </nav>

        <h1 className="font-manrope text-[clamp(2rem,4vw,2.5rem)] font-extrabold tracking-[-0.03em] text-primary m-0">
          Enroll Students
        </h1>
        <p className="text-[0.9375rem] text-on-surface-variant leading-[1.7] mt-2 md:mt-3 max-w-[32rem]">
          {classData.name} • Section {classData.section} • {students.length} enrolled
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Enroll Student Form */}
        <EnrollForm classId={id} />

        {/* Student Roster */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4 mb-2">
            <div>
              <h2 className="text-headline-md m-0">Class Roster</h2>
              <p className="text-body-sm text-on-surface-variant mt-1 m-0">Currently enrolled students in this section.</p>
            </div>
            <span className="text-label-sm text-on-surface-variant">
              {students.length} Students
            </span>
          </div>

          {students.length === 0 ? (
            <div className="text-center py-10 md:py-12 px-6 md:px-8 bg-surface-container-lowest rounded-lg border border-dashed border-outline-variant">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 text-on-surface-variant">
                <AcademicCapIcon className="w-7 h-7 md:w-8 md:h-8" />
              </div>
              <p className="text-headline-sm mb-2">No students enrolled yet</p>
              <p className="text-body-md text-on-surface-variant max-w-sm mx-auto">
                Use the form to add students to this class. They will appear here once enrolled.
              </p>
            </div>
          ) : (
            <div className="bg-surface-container-lowest rounded-lg shadow-sm overflow-hidden">
              <div className="hidden md:block">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      <th className="text-left p-2 px-4 text-[0.625rem] tracking-[0.08em] uppercase text-on-surface-variant font-bold bg-[rgba(244,244,239,0.5)]">
                        Roll No.
                      </th>
                      <th className="text-left p-2 px-4 text-[0.625rem] tracking-[0.08em] uppercase text-on-surface-variant font-bold bg-[rgba(244,244,239,0.5)]">
                        Student
                      </th>
                      <th className="text-left p-2 px-4 text-[0.625rem] tracking-[0.08em] uppercase text-on-surface-variant font-bold bg-[rgba(244,244,239,0.5)]">
                        Phone
                      </th>
                      <th className="text-right p-2 px-4 text-[0.625rem] tracking-[0.08em] uppercase text-on-surface-variant font-bold bg-[rgba(244,244,239,0.5)]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedStudents.map((student) => (
                      <tr key={student.id} className="border-t border-outline/10">
                        <td className="p-2 px-4 align-top">
                          <span className="text-sm font-semibold text-on-surface">
                            {student.rollNumber || "-"}
                          </span>
                        </td>
                        <td className="p-2 px-4 align-top">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-secondary-container text-on-primary-container font-bold flex items-center justify-center shrink-0 text-sm">
                              {student.name.charAt(0)}
                            </div>
                            <p className="m-0 text-sm font-semibold text-on-surface">
                              {student.name}
                            </p>
                          </div>
                        </td>
                        <td className="p-2 px-4 align-top">
                          <span className="text-sm text-on-surface-variant">
                            {student.phone || "-"}
                          </span>
                        </td>
                        <td className="p-2 px-4 align-middle text-right">
                          <div className="flex items-center justify-end gap-3">
                            <Link href={`?edit=${student.id}`} className="text-xs text-primary hover:text-primary-dim font-medium">
                              Edit
                            </Link>
                            <form action={handleRemoveStudent} className="inline">
                              <input type="hidden" name="studentId" value={student.id} />
                              <button type="submit" className="text-xs text-error hover:text-error-dim font-medium">
                                Remove
                              </button>
                            </form>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card Fallback */}
              <div className="grid gap-2 p-3 md:hidden">
                {sortedStudents.map((student) => (
                  <article
                    key={student.id}
                    className="grid gap-2 pb-2 border-b border-outline/15 last:border-b-0 last:pb-0"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-secondary-container text-on-primary-container font-bold flex items-center justify-center shrink-0 text-sm">
                          {student.rollNumber || student.name.charAt(0)}
                        </div>
                        <div>
                          <p className="m-0 text-sm font-semibold text-on-surface">
                            {student.name}
                          </p>
                          <p className="m-0 mt-0.5 text-xs text-on-surface-variant">
                            {student.phone || student.email}
                          </p>
                        </div>
                      </div>
                      <form action={handleRemoveStudent}>
                        <input type="hidden" name="studentId" value={student.id} />
                        <button type="submit" className="text-xs text-error font-medium">
                          Remove
                        </button>
                      </form>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
