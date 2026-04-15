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
      redirect("/teacher/classes");
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
        <h1 className="font-manrope text-4xl font-extrabold text-[#12423f] tracking-tight">Classes</h1>
        <p className="text-[#404847] mt-2 max-w-2xl text-lg">
          Organize your teaching workspace and keep every section attendance-ready
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Create Class Form */}
        <div className="lg:col-span-1">
          <div className="bg-[#f4f4f0] p-8 rounded-xl relative overflow-hidden">
            <div className="relative z-10">
              <h2 className="text-xl font-bold text-[#1c1c1a] mb-6 font-manrope tracking-tight">Create Class</h2>
              <form action={handleCreateClass} className="space-y-6">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#404847] block">Class Name</label>
                  <input
                    name="name"
                    required
                    placeholder="e.g. Grade 10 Mathematics"
                    className="w-full bg-transparent border-0 border-b border-[#707977]/30 focus:border-[#12423f] focus:ring-0 px-0 py-2 text-[#1c1c1a] placeholder:text-[#707977] font-medium transition-colors"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#404847] block">Grade</label>
                  <select
                    name="grade"
                    required
                    className="w-full bg-transparent border-0 border-b border-[#707977]/30 focus:border-[#12423f] focus:ring-0 px-0 py-2 text-[#1c1c1a] font-medium transition-colors cursor-pointer"
                  >
                    <option value="">Select</option>
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={String(i + 1)}>
                        Class {i + 1}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#404847] block">Section</label>
                  <input
                    name="section"
                    required
                    placeholder="e.g. A"
                    className="w-full bg-transparent border-0 border-b border-[#707977]/30 focus:border-[#12423f] focus:ring-0 px-0 py-2 text-[#1c1c1a] placeholder:text-[#707977] font-medium transition-colors"
                  />
                </div>
                <button type="submit" className="w-full mt-4 bg-[#12423f] text-white py-3 rounded-lg font-bold text-sm tracking-wide shadow-sm hover:shadow-md transition-all active:scale-[0.98]">
                  Create Class
                </button>
              </form>
            </div>
            <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-[#cae5e1]/30 rounded-full blur-3xl"></div>
          </div>
        </div>

        {/* Class List */}
        <div className="lg:col-span-3">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-[#1c1c1a] font-manrope tracking-tight">Class Management</h2>
          </div>
          {classes.length === 0 ? (
            <div className="text-center py-10 md:py-12 px-6 md:px-8 bg-[#f4f4f0] rounded-lg border-2 border-dashed border-[#c0c8c6]">
              <div className="w-14 h-14 md:w-16 md:h-16 bg-[#e5e2de] rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4 text-[#707977]">
                <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
              </div>
              <p className="text-lg font-bold text-[#1c1c1a] mb-2">No active classes yet</p>
              <p className="text-[#404847] max-w-sm mx-auto">
                Create your first class to begin attendance, assignments, and section-level classroom operations.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeClasses.length === 0 ? (
                <div className="rounded-lg border border-dashed border-[#c0c8c6] bg-[#f4f4f0] px-5 py-6 text-sm text-[#404847]">
                  No active classes right now. Archived sections are shown below.
                </div>
              ) : (
                activeClasses.map((cls) => (
                  <div
                    key={cls.id}
                    className="bg-[#f4f4f0] hover:bg-white p-6 rounded-xl transition-all duration-300 group hover:shadow-[0px_12px_32px_rgba(27,28,26,0.04)]"
                  >
                    <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 bg-[#12423f] text-white flex items-center justify-center rounded-lg font-bold text-lg tracking-tighter">
                        {cls.section}
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="p-2 text-[#404847] hover:text-[#12423f] hover:bg-[#e5e2de] rounded-lg transition-colors" title="Archive Class">
                          <span className="material-symbols-outlined text-[20px]">archive</span>
                        </button>
                        <button className="p-2 text-[#404847] hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete Class">
                          <span class="material-symbols-outlined text-[20px]">delete</span>
                        </button>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-[#1c1c1a] group-hover:text-[#12423f] transition-colors">{cls.name}</h3>
                      <p className="text-sm text-[#404847] font-medium mt-1">Class {cls.grade} • Section {cls.section}</p>
                    </div>
                    <div className="mt-6 flex gap-3">
                      <Link href={`/teacher/classes/${cls.id}/students`} className="flex-1 bg-[#12423f] text-white py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 text-center no-underline">
                        Enroll Students
                      </Link>
                      <Link href={`/teacher/classes/${cls.id}/attendance`} className="flex-1 bg-[#e5e2de] text-[#4a6360] py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#cae5e1] hover:text-[#12423f] transition-all active:scale-95 text-center no-underline">
                        Attendance
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
