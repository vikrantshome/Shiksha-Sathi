import { getDb } from "@/lib/mongodb";
import CreateAssignmentForm from "@/components/CreateAssignmentForm";

export default async function CreateAssignmentPage() {
  const db = await getDb();
  const classesData = await db.collection("classes").find({}).sort({ createdAt: -1 }).toArray();
  
  const classes = classesData.map(c => ({
    id: c._id.toString(),
    name: c.name,
    section: c.section
  }));

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Assignment</h1>
          <p className="text-gray-500">Review selected questions and publish.</p>
        </div>
      </div>
      
      <CreateAssignmentForm classes={classes} />
    </div>
  );
}
