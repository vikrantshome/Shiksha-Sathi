"use client";

import { useState, useTransition } from "react";
import { api } from "@/lib/api";

const boardOptions = ["CBSE", "ICSE", "State Board", "IB", "IGCSE"];

export default function ProfileForm({
  initialData,
}: {
  initialData: { name?: string; school?: string; board?: string } | null;
}) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [errorHeader, setErrorHeader] = useState("");
  const [board, setBoard] = useState(initialData?.board || "CBSE");

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      try {
        await api.teachers.updateProfile({
          name: formData.get("name") as string,
          school: formData.get("school") as string,
          board,
        });
        setMessage("Profile saved successfully.");
        setErrorHeader("");
        setTimeout(() => setMessage(""), 3000);
      } catch (err: unknown) {
        console.error("Profile update failed:", err);
        const apiError = err as { message?: string };
        setErrorHeader(
          apiError.message || "Failed to update profile. Please try again."
        );
        setMessage("");
      }
    });
  };

  return (
    <form
      action={handleSubmit}
      className="bg-surface-container-lowest rounded-lg shadow-sm p-8 grid gap-8"
    >
      {message ? (
        <div className="p-4 rounded-md bg-success/10 text-success text-sm">
          {message}
        </div>
      ) : null}

      {errorHeader ? (
        <div className="p-4 rounded-md bg-error/10 text-error text-sm">
          {errorHeader}
        </div>
      ) : null}

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
          <label className="text-label-md block text-on-surface-variant mb-2">
            Full Name
          </label>
          <input
            name="name"
            defaultValue={initialData?.name}
            placeholder="e.g. Ananya Rao"
            className="w-full bg-surface-container-highest border-none border-b border-outline-variant py-3 text-[0.9375rem] text-on-surface outline-none transition-colors duration-200 focus:border-primary"
          />
        </div>
      </section>

      <section className="grid gap-5">
        <div>
          <p className="text-label-sm text-on-surface-variant m-0">
            School Details
          </p>
          <h2 className="font-manrope text-lg font-bold text-on-surface mt-1 mb-0">
            Teaching Context
          </h2>
        </div>
        <div>
          <label className="text-label-md block text-on-surface-variant mb-2">
            School Name
          </label>
          <input
            name="school"
            defaultValue={initialData?.school}
            placeholder="e.g. Heritage International School"
            className="w-full bg-surface-container-highest border-none border-b border-outline-variant py-3 text-[0.9375rem] text-on-surface outline-none transition-colors duration-200 focus:border-primary"
          />
        </div>
      </section>

      <section className="grid gap-5">
        <div>
          <p className="text-label-sm text-on-surface-variant m-0">
            Academic Context
          </p>
          <h2 className="font-manrope text-lg font-bold text-on-surface mt-1 mb-0">
            Board Alignment
          </h2>
        </div>

        <input type="hidden" name="board" value={board} />

        <div className="flex flex-wrap gap-3">
          {boardOptions.map((option) => {
            const active = board === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setBoard(option)}
                className={`px-4 py-3 rounded-full border-none cursor-pointer text-sm transition-colors ${
                  active
                    ? "font-bold bg-secondary-container text-primary"
                    : "font-medium bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
                }`}
              >
                {option}
              </button>
            );
          })}
        </div>
      </section>

      <div className="flex justify-between items-center gap-4 flex-wrap pt-4">
        <p className="m-0 text-[0.8125rem] text-on-surface-variant max-w-[26rem] leading-[1.7]">
          Keeping your profile current helps Shiksha Sathi tailor class and question-bank context to your teaching environment.
        </p>
        <button
          type="submit"
          disabled={isPending}
          className="px-8 py-3 border-none rounded-lg bg-gradient-to-br from-primary to-primary-dim text-on-primary font-bold tracking-[0.03em] shadow-sm cursor-pointer transition-all hover:opacity-90 hover:-translate-y-[1px] active:scale-[0.98] disabled:opacity-75 disabled:cursor-wait"
        >
          {isPending ? "Saving Profile…" : "Save Profile"}
        </button>
      </div>
    </form>
  );
}
