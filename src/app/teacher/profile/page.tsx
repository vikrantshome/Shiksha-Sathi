import { redirect } from "next/navigation";
import { api } from "@/lib/api";
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

  return (
    <div className="max-w-[72rem] mx-auto pb-10 md:pb-12">
      <section className="mb-6 md:mb-8 lg:mb-10">
        <p className="text-label-sm text-on-surface-variant m-0">
          Teacher Profile
        </p>
        <h1 className="font-headline text-[clamp(2rem,4vw,2.5rem)] font-extrabold tracking-[-0.03em] text-primary mt-2 mb-0">
          Your Profile
        </h1>
        <p className="text-[0.9375rem] text-on-surface-variant leading-[1.7] mt-2 md:mt-3 mb-0 max-w-[42rem]">
          Personalize your Shiksha Sathi workspace by keeping your school and
          board context current. This keeps classes, assignments, and
          question-bank recommendations grounded in your teaching reality.
        </p>
      </section>

      {errorState ? (
        <div className="mb-4 md:mb-6 p-3 md:p-4 rounded-md bg-error/[0.08] text-error text-sm">
          Error loading profile data.
        </div>
      ) : (
        <div className="bg-surface-container-lowest rounded-lg shadow-sm p-8 grid gap-8">
          <section className="grid gap-5">
            <div>
              <p className="text-label-sm text-on-surface-variant m-0">
                Personal Details
              </p>
              <h2 className="font-manrope text-xl font-bold text-on-surface mt-1 mb-0">
                Your Profile
              </h2>
            </div>
            <div>
              <label className="text-label-md block text-on-surface-variant mb-1">
                Full Name
              </label>
              <p className="text-[0.9375rem] text-on-surface">
                {profile?.name || "Not set"}
              </p>
            </div>
          </section>

          <section className="grid gap-5">
            <div>
              <label className="text-label-md block text-on-surface-variant mb-1">
                School Name
              </label>
              <p className="text-[0.9375rem] text-on-surface">
                {profile?.school || "Not set"}
              </p>
            </div>
          </section>

          <section className="grid gap-5">
            <div>
              <label className="text-label-md block text-on-surface-variant mb-1">
                Board
              </label>
              <p className="text-[0.9375rem] text-on-surface">
                {profile?.board || "Not set"}
              </p>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}