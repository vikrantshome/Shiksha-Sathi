"use client";

import { useTransition, useState } from "react";
import { api } from "@/lib/api";

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
      style={{
        background: "var(--color-surface-container-lowest)",
        padding: "var(--space-6)",
        borderRadius: "var(--radius-md)",
        display: "flex",
        flexDirection: "column",
        gap: "var(--space-5)",
      }}
    >
      {message && (
        <div
          style={{
            padding: "var(--space-3)",
            background: "var(--color-success-container)",
            color: "var(--color-success)",
            borderRadius: "var(--radius-sm)",
            fontSize: "0.8125rem",
          }}
        >
          {message}
        </div>
      )}
      {errorHeader && (
        <div
          style={{
            padding: "var(--space-3)",
            background: "var(--color-error-container)",
            color: "var(--color-error)",
            borderRadius: "var(--radius-sm)",
            fontSize: "0.8125rem",
          }}
        >
          {errorHeader}
        </div>
      )}

      <div>
        <label
          className="text-label-md"
          style={{
            display: "block",
            color: "var(--color-on-surface-variant)",
            marginBottom: "var(--space-1-5)",
          }}
        >
          Full Name
        </label>
        <input
          name="name"
          defaultValue={initialData?.name}
          placeholder="e.g. Mr. Sharma"
          className="input-academic"
        />
      </div>

      <div>
        <label
          className="text-label-md"
          style={{
            display: "block",
            color: "var(--color-on-surface-variant)",
            marginBottom: "var(--space-1-5)",
          }}
        >
          School Name
        </label>
        <input
          name="school"
          defaultValue={initialData?.school}
          placeholder="e.g. Delhi Public School"
          className="input-academic"
        />
      </div>

      <div>
        <label
          className="text-label-md"
          style={{
            display: "block",
            color: "var(--color-on-surface-variant)",
            marginBottom: "var(--space-1-5)",
          }}
        >
          Board / Curriculum
        </label>
        <input
          name="board"
          defaultValue={initialData?.board}
          placeholder="e.g. CBSE"
          className="input-academic"
        />
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="btn-primary"
        style={{
          width: "fit-content",
          padding: "var(--space-2-5) var(--space-6)",
        }}
      >
        {isPending ? "Saving…" : "Save Profile"}
      </button>
    </form>
  );
}
