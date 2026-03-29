import { api } from "@/lib/api";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";
import { ClassItem } from "@/lib/api/types";
import { PlusIcon, UserGroupIcon, AcademicCapIcon, ArchiveBoxIcon, TrashIcon } from "@heroicons/react/24/outline";

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

  // Handle class creation
  async function handleCreateClass(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const section = formData.get("section") as string;
    const studentCount = parseInt(
      formData.get("studentCount") as string,
      10
    );

    try {
      await api.classes.createClass({ name, section, studentCount });
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
    <div className="pb-8">
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-display-sm">Classes</h1>
        <p className="text-body-md text-on-surface-variant mt-1">
          Manage your active classes and sections
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Create Class Form */}
        <div className="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant h-fit">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center">
              <PlusIcon className="w-4 h-4 text-on-primary-container" />
            </div>
            <h2 className="text-headline-sm">Create Class</h2>
          </div>
          <form action={handleCreateClass} className="flex flex-col gap-4">
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
                  Section
                </label>
                <input
                  name="section"
                  required
                  placeholder="e.g. A"
                  className="input-academic w-full"
                />
              </div>
              <div>
                <label className="block text-label-md text-on-surface-variant mb-1.5">
                  Students
                </label>
                <input
                  name="studentCount"
                  type="number"
                  min="1"
                  required
                  placeholder="e.g. 30"
                  className="input-academic w-full"
                />
              </div>
            </div>
            <button type="submit" className="btn-primary w-full justify-center mt-2">
              Create Class
            </button>
          </form>
        </div>

        {/* Class List */}
        <div className="md:col-span-2 flex flex-col gap-4">
          {classes.length === 0 ? (
            <div className="text-center py-12 px-8 bg-surface-container-lowest rounded-xl border border-dashed border-outline-variant">
              <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center mx-auto mb-4 text-on-surface-variant">
                <AcademicCapIcon className="w-8 h-8" />
              </div>
              <p className="text-headline-sm mb-2">No active classes</p>
              <p className="text-body-md text-on-surface-variant max-w-sm mx-auto">
                Create your first class to start tracking attendance and assignments.
              </p>
            </div>
          ) : (
            classes
              .filter((cls) => cls.active)
              .map((cls) => (
                <div
                  key={cls.id}
                  className="bg-surface-container-lowest p-5 rounded-xl border border-outline-variant transition-all hover:shadow-[0_4px_12px_rgba(0,0,0,0.05)] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-secondary-container flex items-center justify-center flex-shrink-0">
                      <span className="text-on-secondary-container font-semibold">
                        {cls.section}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-title-md font-semibold text-on-surface">
                        {cls.name}
                      </h3>
                      <div className="flex items-center text-body-sm text-on-surface-variant mt-1 gap-3">
                        <span className="flex items-center gap-1">
                          <UserGroupIcon className="w-4 h-4" />
                          {cls.studentCount} Students
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/teacher/classes/${cls.id}/attendance`}
                      className="btn-academic bg-primary-container text-on-primary-container hover:bg-primary hover:text-white"
                    >
                      Attendance
                    </Link>
                    <form action={handleArchiveClass.bind(null, cls.id)}>
                      <button
                        type="submit"
                        className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-full transition-colors"
                        title="Archive Class"
                      >
                        <ArchiveBoxIcon className="w-5 h-5" />
                      </button>
                    </form>
                    <form action={handleDeleteClass.bind(null, cls.id)}>
                      <button
                        type="submit"
                        className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container rounded-full transition-colors"
                        title="Delete Class"
                      >
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </form>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
