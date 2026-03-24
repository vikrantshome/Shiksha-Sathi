import { getDb } from "@/lib/mongodb";
import { createClassAction, deleteClassAction, archiveClassAction } from "@/app/actions/classes";

export default async function ClassesPage() {
  const db = await getDb();
  // Fetch classes from MongoDB, ignoring archived ones
  const classesData = await db.collection("classes").find({ archived: { $ne: true } }).sort({ createdAt: -1 }).toArray();
  
  // Transform to plain objects to pass to client components or render directly
  const classes = classesData.map(cls => ({
    id: cls._id.toString(),
    name: cls.name,
    section: cls.section,
    studentCount: cls.studentCount,
    createdAt: cls.createdAt,
  }));

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
          <form action={createClassAction} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Class Name</label>
              <input 
                name="name" 
                required 
                placeholder="e.g. Grade 10 Mathematics" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Section</label>
              <input 
                name="section" 
                required 
                placeholder="e.g. A" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button 
              type="submit" 
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
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
            classes.map((cls) => (
              <div key={cls.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center hover:border-blue-300 transition-colors">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{cls.name}</h3>
                  <p className="text-sm text-gray-500">Section {cls.section} • {cls.studentCount} Students</p>
                </div>
                <div className="flex gap-2">
                  <form action={async () => {
                    "use server";
                    await archiveClassAction(cls.id);
                  }}>
                    <button type="submit" className="text-gray-600 hover:text-gray-900 text-sm font-medium px-3 py-1 rounded border border-gray-200 hover:bg-gray-50 transition-colors">
                      Archive
                    </button>
                  </form>
                  <form action={async () => {
                    "use server";
                    await deleteClassAction(cls.id);
                  }}>
                    <button type="submit" className="text-red-600 hover:text-red-800 text-sm font-medium px-3 py-1 rounded hover:bg-red-50 transition-colors">
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
