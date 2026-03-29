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
    <div className="max-w-2xl mx-auto">
      <div style={{ marginBottom: "var(--space-6)" }}>
        <h1 className="text-display-sm">Teacher Profile</h1>
        {errorState ? (
          <p
            className="text-body-sm"
            style={{ color: "var(--color-error)", marginTop: "var(--space-1)" }}
          >
            Error loading profile data. Please try again.
          </p>
        ) : (
          <p
            className="text-body-md"
            style={{
              color: "var(--color-on-surface-variant)",
              marginTop: "var(--space-1)",
            }}
          >
            Manage your personal and school details.
          </p>
        )}
      </div>
      <ProfileForm initialData={initialData} />
    </div>
  );
}
