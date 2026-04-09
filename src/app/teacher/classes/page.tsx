import { api } from "@/lib/api";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { ClassItem } from "@/lib/api/types";
import ClassActionButtons from "@/components/ClassActionButtons";
import { PlusIcon, AcademicCapIcon } from "@heroicons/react/24/outline";

export const dynamic = "force-dynamic";

export default async function ClassesPage() {
  let classes: ClassItem[] = [];
  try {
    classes = await api.classes.getClasses();
  } catch (err: unknown) {
    const error = err as { status?: number };
    if (error.status === 401) {
      redirect("/login");
    }
    console.error("Failed to load classes:", err);
  }

  const activeClasses = classes.filter((cls) => cls.active);
  const archivedClasses = classes.filter((cls) => !cls.active);

  // Handle class creation
  async function handleCreateClass(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const section = formData.get("section") as string;
    const grade = formData.get("grade") as string;

    try {
      await api.classes.createClass({ name, section, grade });
      revalidatePath("/teacher/classes");
    } catch (error) {
      console.error("Failed to create class:", error);
    }
  }

  // Handle class archival
  async function handleArchiveClass(id: string) {
    "use server";
    try {
      await api.classes.archiveClass(id);
      revalidatePath("/teacher/classes");
    } catch (error) {
      console.error("Failed to archive class:", error);
    }
  }

  // Handle class deletion
  async function handleDeleteClass(id: string) {
    "use server";
    try {
      await api.classes.deleteClass(id);
      revalidatePath("/teacher/classes");
    } catch (error) {
      console.error("Failed to delete class:", error);
    }
  }

  return (
    <div className="pb-8 md:pb-10">
      {/* Page Header */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-display-sm">Classes</h1>
        <p className="text-body-md text-on-surface-variant mt-1">
          Organize your teaching workspace and keep every section attendance-ready
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {/* Create Class Form */}
        <div className="bg-surface-container-low p-5 md:p-6 lg:p-8 rounded-lg h-fit relative overflow-hidden">
          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-5">
            <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center">
              <PlusIcon className="w-4 h-4 text-on-primary-container" />
            </div>
            <h2 className="text-headline-md">Create Class</h2>
          </div>
          <form action={handleCreateClass} className="flex flex-col gap-4 md:gap-5 relative z-10">
            <div>
              <label className="block text-label-md text-on-surface-variant mb-1.5">
                Class Name
              </label>
              <input
                name="name"
                required
                placeholder="e.g. Grade 10 Mathematics"
                className="input-academic w-full"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-label-md text-on-surface-variant mb-1.5">
                  Grade
                </label>
                <select
                  name="grade"
                  required
                  className="input-academic w-full cursor-pointer"
                >
                  <option value="">Select</option>
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={String(i + 1)}>
                      Class {i + 1}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-label-md text-on-surface-variant mb-1.5">
                  Section
                </label>
                <input
                  name="section"
                  required
                  placeholder="e.g. A"
                  className="input-academic w-full"
                />
              </div>
            </div>
            <button type="submit" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-br from-primary to-primary-dim text-on-primary text-sm font-medium leading-[1.3] tracking-[0.02em] rounded-sm transition-all duration-150 ease-out hover:opacity-90 hover:shadow-sm active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed w-full justify-center mt-2">
              Create Class
            </button>
          </form>
        </div>

        {/* Class List */}
        <div className="md:col-span-2 flex flex-col gap-4">
          <div className="flex items-center justify-between gap-4 mb-2">
            <div>
              <h2 className="text-headline-md">Class Management</h2>
              <p className="text-body-sm text-on-surface-variant mt-1">Track attendance-ready sections and archive older cohorts with care.</p>
            </div>
          </div>
          {classes.length === 0 ? (
            <div className="text-center py-10 md:py-12 px-6 md:px-8 bg-surface-container-lowest rounded-lg border border-dashed border-outline-variant">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 text-on-surface-variant">
                <AcademicCapIcon className="w-7 h-7 md:w-8 md:h-8" />
              </div>
              <p className="text-headline-sm mb-2">No active classes yet</p>
              <p className="text-body-md text-on-surface-variant max-w-sm mx-auto">
                Create your first class to begin attendance, assignments, and section-level classroom operations.
              </p>
            </div>
          ) : (
            <div className="grid gap-6">
              <div className="grid gap-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-title-md font-semibold text-on-surface m-0">
                      Active Classes
                    </h3>
                    <p className="text-body-sm text-on-surface-variant mt-1 m-0">
                      Attendance-ready sections currently in use.
                    </p>
                  </div>
                  <span className="text-label-sm text-on-surface-variant">
                    {activeClasses.length}
                  </span>
                </div>

                {activeClasses.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-outline-variant bg-surface-container-lowest px-5 py-6 text-sm text-on-surface-variant">
                    No active classes right now. Archived sections are shown below.
                  </div>
                ) : (
                  activeClasses.map((cls) => (
                    <div
                      key={cls.id}
                      className="bg-surface-container-low p-4 md:p-5 lg:p-6 rounded-lg transition-all hover:bg-surface-container-lowest hover:shadow-[0_12px_32px_rgba(27,28,26,0.04)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4"
                    >
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-secondary-container flex items-center justify-center flex-shrink-0">
                          <span className="text-on-secondary-container font-semibold">
                            {cls.section}
                          </span>
                        </div>
                        <div>
                          <h3 className="text-title-md font-semibold text-on-surface">
                            {cls.name}
                          </h3>
                          <div className="flex items-center text-body-sm text-on-surface-variant mt-1 gap-3">
                            <span>Class {cls.grade} • Section {cls.section}</span>
                          </div>
                        </div>
                      </div>
                      <ClassActionButtons
                        enrollHref={`/teacher/classes/${cls.id}/students`}
                        attendanceHref={`/teacher/classes/${cls.id}/attendance`}
                        archiveAction={handleArchiveClass.bind(null, cls.id)}
                        deleteAction={handleDeleteClass.bind(null, cls.id)}
                        className={cls.name}
                      />
                    </div>
                  ))
                )}
              </div>

              {archivedClasses.length > 0 && (
                <div className="grid gap-4">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-title-md font-semibold text-on-surface m-0">
                        Archived Classes
                      </h3>
                      <p className="text-body-sm text-on-surface-variant mt-1 m-0">
                        Previously used sections that are no longer active.
                      </p>
                    </div>
                    <span className="text-label-sm text-on-surface-variant">
                      {archivedClasses.length}
                    </span>
                  </div>

                  {archivedClasses.map((cls) => (
                    <div
                      key={cls.id}
                      className="bg-surface-container-lowest p-4 md:p-5 lg:p-6 rounded-lg border border-outline-variant/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4"
                    >
                      <div className="flex items-center gap-3 md:gap-4">
                        <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0">
                          <span className="text-on-surface-variant font-semibold">
                            {cls.section}
                          </span>
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-title-md font-semibold text-on-surface m-0">
                              {cls.name}
                            </h3>
                            <span className="rounded-full bg-surface-container px-2.5 py-1 text-[0.625rem] font-bold uppercase tracking-[0.08em] text-on-surface-variant">
                              Archived
                            </span>
                          </div>
                          <div className="flex items-center text-body-sm text-on-surface-variant mt-1 gap-3">
                            <span>Class {cls.grade} • Section {cls.section}</span>
                          </div>
                        </div>
                      </div>
                      <ClassActionButtons
                        deleteAction={handleDeleteClass.bind(null, cls.id)}
                        className={cls.name}
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
