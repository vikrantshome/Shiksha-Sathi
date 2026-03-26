import { api } from "@/lib/api";
import ProfileForm from "@/components/ProfileForm";
import { redirect } from "next/navigation";
import { ProfileResponse } from "@/lib/api/types";

export default async function ProfilePage() {
  let profile: ProfileResponse | null = null;
  let errorState = false;

  try {
    profile = await api.teachers.getProfile();
  } catch (error: unknown) {
    const apiError = error as { status?: number };
    if (apiError.status === 401) {
      redirect("/login");
    }
    console.error("Failed to load profile:", error);
    errorState = true;
  }

  const initialData = {
    name: profile?.name || "",
    school: profile?.school || "",
    board: profile?.board || ""
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Teacher Profile</h1>
        {errorState ? (
          <p className="text-red-500">Error loading profile data. Please try again.</p>
        ) : (
          <p className="text-gray-500">Manage your personal and school details.</p>
        )}
      </div>
      <ProfileForm initialData={initialData} />
    </div>
  );
}
