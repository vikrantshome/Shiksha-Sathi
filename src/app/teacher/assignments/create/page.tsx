import { api } from "@/lib/api";
import CreateAssignmentForm from "@/components/CreateAssignmentForm";
import { ClassItem } from "@/lib/api/types";

export default async function CreateAssignmentPage() {
  const classesData = await api.classes.getClasses();
  
  const classes = classesData.map((c: ClassItem) => ({
    id: c.id,
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
