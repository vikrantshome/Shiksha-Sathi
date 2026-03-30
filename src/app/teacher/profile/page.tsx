import { redirect } from "next/navigation";
import { api } from "@/lib/api";
import ProfileForm from "@/components/ProfileForm";
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
    board: profile?.board || "CBSE",
  };

  const profileStrength = initialData.school && initialData.board
    ? 100
    : initialData.name
    ? 66
    : 33;

  return (
    <div className="max-w-[72rem] mx-auto pb-12">
      <section className="mb-10">
        <p className="text-label-sm text-on-surface-variant m-0">
          Teacher Profile
        </p>
        <h1 className="font-headline text-[clamp(2rem,4vw,2.5rem)] font-extrabold tracking-[-0.03em] text-primary mt-2 mb-0">
          Your Profile
        </h1>
        <p className="text-[0.9375rem] text-on-surface-variant leading-[1.7] mt-3 mb-0 max-w-[42rem]">
          Personalize your Shiksha Sathi workspace by keeping your school and
          board context current. This keeps classes, assignments, and
          question-bank recommendations grounded in your teaching reality.
        </p>
      </section>

      {errorState && (
        <div className="mb-6 p-4 rounded-md bg-error/[0.08] text-error text-sm">
          Error loading profile data. You can still update your details below
          and try saving again.
        </div>
      )}

      {/* 2-column on desktop, stacked on mobile */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,24rem)] lg:items-start">
        <div>
          <ProfileForm initialData={initialData} />
        </div>

        <aside className="grid gap-6">
          {/* Profile Strength Card */}
          <section className="bg-primary-container rounded-lg p-6">
            <p className="text-label-sm text-on-primary-container m-0">
              Profile Strength
            </p>
            <div className="w-full h-2 bg-white/35 rounded-full overflow-hidden mt-4">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${profileStrength}%` }}
              />
            </div>
            <p className="text-[0.8125rem] leading-[1.7] text-on-primary-container mt-3 mb-0">
              Complete school and board context so your teaching workspace stays
              aligned with the right curriculum signals.
            </p>
          </section>

          {/* Teacher Insight Card */}
          <section className="bg-tertiary-container rounded-lg p-6">
            <p className="text-label-sm text-[#311305] m-0">
              Teacher Insight
            </p>
            <p className="text-sm leading-[1.7] text-[#311305] mt-3 mb-0">
              Teachers with clear board alignment move faster from question
              selection to assignment publication because the workspace can
              narrow content sooner.
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
