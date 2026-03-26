import { api } from "@/lib/api";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export const dynamic = "force-dynamic";

import { ClassItem } from "@/lib/api/types";

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
    const studentCount = parseInt(formData.get("studentCount") as string, 10);

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
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Classes</h1>
          <p className="text-gray-500">Manage your active classes and sections</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Create Class Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 h-fit">
          <h2 className="text-lg font-semibold mb-4">Create New Class</h2>
          <form action={handleCreateClass} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
              <input 
                name="name" 
                required 
                placeholder="e.g. Grade 10 Mathematics" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
              <input 
                name="section" 
                required 
                placeholder="e.g. A" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Student Count</label>
              <input 
                name="studentCount" 
                type="number" 
                min="1" 
                required 
                placeholder="e.g. 30" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-blue-600 text-white py-2.5 px-4 rounded-md hover:bg-blue-700 active:bg-blue-800 transition-all font-medium shadow-sm active:shadow-inner"
            >
              Create Class
            </button>
          </form>
        </div>

        {/* Class List */}
        <div className="md:col-span-2 space-y-4">
          {classes.length === 0 ? (
            <div className="text-center p-12 bg-white rounded-xl border border-gray-200 border-dashed">
              <p className="text-gray-500">No active classes found. Create your first class to get started.</p>
            </div>
          ) : (
            classes.filter(cls => cls.active).map((cls) => (
              <div key={cls.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center hover:border-blue-300 transition-all hover:shadow-md animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{cls.name}</h3>
                  <p className="text-sm text-gray-500">Section {cls.section} • {cls.studentCount} Students</p>
                </div>
                <div className="flex gap-3">
                  <Link 
                    href={`/teacher/classes/${cls.id}/attendance`}
                    className="text-blue-600 hover:text-blue-900 text-sm font-semibold px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 transition-all"
                  >
                    Attendance
                  </Link>
                  <form action={handleArchiveClass.bind(null, cls.id)}>
                    <button type="submit" className="text-gray-600 hover:text-gray-900 text-sm font-medium px-4 py-2 rounded-lg border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all">
                      Archive
                    </button>
                  </form>
                  <form action={handleDeleteClass.bind(null, cls.id)}>
                    <button type="submit" className="text-red-600 hover:text-red-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-red-50 transition-all">
                      Delete
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
