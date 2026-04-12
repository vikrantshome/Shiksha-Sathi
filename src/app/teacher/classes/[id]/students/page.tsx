import { api } from "@/lib/api";
import { redirect } from "next/navigation";
import Link from "next/link";
import { ClassItem, User } from "@/lib/api/types";
import { UserPlusIcon, AcademicCapIcon } from "@heroicons/react/24/outline";
import { enrollStudent, removeStudent } from "./actions";

export const dynamic = "force-dynamic";

export default async function ClassStudentsPage(props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;

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

  async function handleEnrollStudent(formData: FormData) {
    "use server";
    const result = await enrollStudent(id, {
      name: formData.get("studentName") as string,
      phone: formData.get("studentPhone") as string,
      birthDate: formData.get("birthDate") as string,
    });
    if (result?.error) {
      console.error("Enrollment error:", result.error);
    }
    redirect(`/teacher/classes/${id}/students`);
  }

  async function handleRemoveStudent(formData: FormData) {
    "use server";
    const studentId = formData.get("studentId") as string;
    await removeStudent(id, studentId || "");
    redirect(`/teacher/classes/${id}/students`);
  }

  return (
    <div className="pb-8 md:pb-10">
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
        <div className="bg-surface-container-low p-5 md:p-6 lg:p-8 rounded-lg h-fit relative overflow-hidden">
          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-5">
            <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center">
              <UserPlusIcon className="w-4 h-4 text-on-primary-container" />
            </div>
            <h2 className="text-headline-md m-0">Enroll Student</h2>
          </div>
          <form action={handleEnrollStudent} className="flex flex-col gap-4 md:gap-5 relative z-10">
            {/* Student Name */}
            <div>
              <label className="block text-label-md text-on-surface-variant mb-1.5">
                Student Name <span className="text-error">*</span>
              </label>
              <input
                name="studentName"
                required
                placeholder="e.g. Aarav Patel"
                className="input-academic w-full"
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-label-md text-on-surface-variant mb-1.5">
                Phone Number <span className="text-error">*</span>
              </label>
              <input
                name="studentPhone"
                required
                maxLength={10}
                pattern="[0-9]{10}"
                placeholder="e.g. 9876543210"
                className="input-academic w-full"
              />
            </div>

            {/* Birth Date */}
            <div>
              <label className="block text-label-md text-on-surface-variant mb-1.5">
                Date of Birth <span className="text-error">*</span>
              </label>
              <input
                name="birthDate"
                required
                placeholder="DD-MM-YYYY"
                pattern="\d{2}-\d{2}-\d{4}"
                className="input-academic w-full"
              />
              <p className="text-xs text-on-surface-variant mt-2">
                Format: DD-MM-YYYY. This will be set as the student&apos;s default password.
              </p>
            </div>

            <button type="submit" className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium leading-[1.3] tracking-[0.02em] rounded-sm transition-all duration-150 ease-out hover:opacity-90 hover:shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed w-full justify-center mt-2" style={{ background: "linear-gradient(145deg, var(--color-primary), var(--color-primary-dim))", color: "var(--color-on-primary)" }}>
              Enroll Student
            </button>
          </form>
        </div>

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
                      <th className="text-left p-3 md:p-4 px-4 md:px-6 text-[0.6875rem] tracking-[0.08em] uppercase text-on-surface-variant font-bold bg-[rgba(244,244,239,0.5)]">
                        Student
                      </th>
                      <th className="text-right p-3 md:p-4 px-4 md:px-6 text-[0.6875rem] tracking-[0.08em] uppercase text-on-surface-variant font-bold bg-[rgba(244,244,239,0.5)]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
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
                                {student.phone || student.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 md:p-5 px-4 md:px-6 align-middle text-right">
                          <form action={handleRemoveStudent} className="inline">
                            <input type="hidden" name="studentId" value={student.id} />
                            <button type="submit" className="text-xs text-error hover:text-error-dim font-medium">
                              Remove
                            </button>
                          </form>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card Fallback */}
              <div className="grid gap-4 p-5 md:hidden">
                {students.map((student) => (
                  <article
                    key={student.id}
                    className="grid gap-4 pb-4 border-b border-outline/15 last:border-b-0 last:pb-0"
                  >
                    <div className="flex items-center justify-between gap-4 flex-wrap">
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="w-10 h-10 rounded-full bg-secondary-container text-on-primary-container font-bold flex items-center justify-center shrink-0">
                          {student.name.charAt(0)}
                        </div>
                        <div>
                          <p className="m-0 text-[0.9375rem] font-semibold text-on-surface">
                            {student.name}
                          </p>
                          <p className="m-0 mt-1 text-xs text-on-surface-variant">
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
