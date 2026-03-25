import { getDb } from "@/lib/mongodb";
import { cookies } from "next/headers";
import ProfileForm from "@/components/ProfileForm";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  
  const db = await getDb();
  const profile = await db.collection("profiles").findOne({ session });

  const initialData = profile 
    ? { name: profile.name, school: profile.school, board: profile.board }
    : { name: "", school: "", board: "" };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Teacher Profile</h1>
          <p className="text-gray-500">Manage your personal and school details.</p>
        </div>
      </div>
      <ProfileForm initialData={initialData} />
    </div>
  );
}
