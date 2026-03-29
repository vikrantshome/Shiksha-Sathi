import { api } from "@/lib/api";
import ProfileForm from "@/components/ProfileForm";
import { redirect } from "next/navigation";
import { ProfileResponse } from "@/lib/api/types";

export const dynamic = "force-dynamic";

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
    board: profile?.board || "",
  };

  return (
    <div className="max-w-3xl mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-display-sm font-bold text-on-surface mb-2">Teacher Profile</h1>
        {errorState ? (
          <p className="text-body-sm text-error bg-error-container/30 border border-error/20 inline-block px-3 py-1.5 rounded-md mt-2">
            Error loading profile data. Please try again.
          </p>
        ) : (
          <p className="text-body-md text-on-surface-variant max-w-lg">
            Manage your personal and school details. This information will be used to personalize your experience.
          </p>
        )}
      </div>
      <ProfileForm initialData={initialData} />
    </div>
  );
}
