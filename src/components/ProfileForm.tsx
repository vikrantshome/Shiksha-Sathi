"use client";

import { useTransition, useState } from "react";
import { api } from "@/lib/api";
import { UserCircleIcon, IdentificationIcon, AcademicCapIcon, CheckCircleIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";

export default function ProfileForm({
  initialData,
}: {
  initialData: { name?: string; school?: string; board?: string } | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [errorHeader, setErrorHeader] = useState("");

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      try {
        await api.teachers.updateProfile({
          name: formData.get("name") as string,
          school: formData.get("school") as string,
          board: formData.get("board") as string,
        });
        setMessage("Profile saved successfully.");
        setErrorHeader("");
        setTimeout(() => setMessage(""), 3000);
      } catch (err: unknown) {
        console.error("Profile update failed:", err);
        const error = err as { message?: string };
        setErrorHeader(
          error.message || "Failed to update profile. Please try again."
        );
        setMessage("");
      }
    });
  };

  return (
    <form
      action={handleSubmit}
      className="bg-surface-container-lowest p-8 rounded-xl border border-outline-variant/30 shadow-sm flex flex-col gap-6"
    >
      <div className="border-b border-outline-variant/20 pb-4 mb-2">
        <h2 className="text-headline-sm font-semibold text-on-surface">Personal Information</h2>
        <p className="text-body-sm text-on-surface-variant mt-1">Update your profile details and school affiliations.</p>
      </div>

      {message && (
        <div className="p-4 bg-success-container/50 border border-success/20 text-success rounded-lg text-body-sm flex items-start gap-3">
          <CheckCircleIcon className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{message}</span>
        </div>
      )}
      {errorHeader && (
        <div className="p-4 bg-error-container/50 border border-error/20 text-error rounded-lg text-body-sm flex items-start gap-3">
          <ExclamationCircleIcon className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{errorHeader}</span>
        </div>
      )}

      <div className="flex flex-col gap-5">
        <div>
          <label className="text-label-md block text-on-surface-variant mb-2 font-medium">
            Full Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <UserCircleIcon className="h-5 w-5 text-on-surface-variant/70" />
            </div>
            <input
              name="name"
              defaultValue={initialData?.name}
              placeholder="e.g. Mr. Sharma"
              className="input-academic pl-10"
            />
          </div>
        </div>

        <div>
          <label className="text-label-md block text-on-surface-variant mb-2 font-medium">
            School Name
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <AcademicCapIcon className="h-5 w-5 text-on-surface-variant/70" />
            </div>
            <input
              name="school"
              defaultValue={initialData?.school}
              placeholder="e.g. Delhi Public School"
              className="input-academic pl-10"
            />
          </div>
        </div>

        <div>
          <label className="text-label-md block text-on-surface-variant mb-2 font-medium">
            Board / Curriculum
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <IdentificationIcon className="h-5 w-5 text-on-surface-variant/70" />
            </div>
            <input
              name="board"
              defaultValue={initialData?.board}
              placeholder="e.g. CBSE"
              className="input-academic pl-10"
            />
          </div>
        </div>
      </div>

      <div className="pt-4 mt-2 border-t border-outline-variant/20 flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="btn-primary w-full sm:w-auto px-8"
        >
          {isPending ? "Saving Profile…" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}
