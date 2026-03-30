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
      style={{
        background: "var(--color-surface-container-lowest)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-sm)",
        padding: "var(--space-8)",
        display: "grid",
        gap: "var(--space-8)",
      }}
    >
      {message ? (
        <div
          style={{
            padding: "var(--space-4)",
            borderRadius: "var(--radius-md)",
            background: "rgba(45, 106, 79, 0.1)",
            color: "var(--color-success)",
            fontSize: "0.875rem",
          }}
        >
          {message}
        </div>
      ) : null}

      {errorHeader ? (
        <div
          style={{
            padding: "var(--space-4)",
            borderRadius: "var(--radius-md)",
            background: "rgba(168, 56, 54, 0.1)",
            color: "var(--color-error)",
            fontSize: "0.875rem",
          }}
        >
          {errorHeader}
        </div>
      ) : null}

      <section style={{ display: "grid", gap: "var(--space-5)" }}>
        <div>
          <p className="text-label-sm" style={{ color: "var(--color-on-surface-variant)", margin: 0 }}>
            Personal Details
          </p>
          <h2
            style={{
              fontFamily: "var(--font-manrope), system-ui, sans-serif",
              fontSize: "1.25rem",
              fontWeight: 700,
              color: "var(--color-on-surface)",
              margin: "var(--space-1) 0 0",
            }}
          >
            Your Profile
          </h2>
        </div>
        <div>
          <label className="text-label-md" style={{ display: "block", color: "var(--color-on-surface-variant)", marginBottom: "var(--space-2)" }}>
            Full Name
          </label>
          <input
            name="name"
            defaultValue={initialData?.name}
            placeholder="e.g. Ananya Rao"
            className="profile-input"
          />
        </div>
      </section>

      <section style={{ display: "grid", gap: "var(--space-5)" }}>
        <div>
          <p className="text-label-sm" style={{ color: "var(--color-on-surface-variant)", margin: 0 }}>
            School Details
          </p>
          <h2
            style={{
              fontFamily: "var(--font-manrope), system-ui, sans-serif",
              fontSize: "1.125rem",
              fontWeight: 700,
              color: "var(--color-on-surface)",
              margin: "var(--space-1) 0 0",
            }}
          >
            Teaching Context
          </h2>
        </div>
        <div>
          <label className="text-label-md" style={{ display: "block", color: "var(--color-on-surface-variant)", marginBottom: "var(--space-2)" }}>
            School Name
          </label>
          <input
            name="school"
            defaultValue={initialData?.school}
            placeholder="e.g. Heritage International School"
            className="profile-input"
          />
        </div>
      </section>

      <section style={{ display: "grid", gap: "var(--space-5)" }}>
        <div>
          <p className="text-label-sm" style={{ color: "var(--color-on-surface-variant)", margin: 0 }}>
            Academic Context
          </p>
          <h2
            style={{
              fontFamily: "var(--font-manrope), system-ui, sans-serif",
              fontSize: "1.125rem",
              fontWeight: 700,
              color: "var(--color-on-surface)",
              margin: "var(--space-1) 0 0",
            }}
          >
            Board Alignment
          </h2>
        </div>

        <input type="hidden" name="board" value={board} />

        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--space-3)" }}>
          {boardOptions.map((option) => {
            const active = board === option;
            return (
              <button
                key={option}
                type="button"
                onClick={() => setBoard(option)}
                style={{
                  padding: "var(--space-3) var(--space-4)",
                  borderRadius: "var(--radius-full)",
                  border: "none",
                  cursor: "pointer",
                  fontSize: "0.875rem",
                  fontWeight: active ? 700 : 500,
                  background: active
                    ? "var(--color-secondary-container)"
                    : "var(--color-surface-container-low)",
                  color: active
                    ? "var(--color-primary)"
                    : "var(--color-on-surface-variant)",
                }}
              >
                {option}
              </button>
            );
          })}
        </div>
      </section>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "var(--space-4)",
          flexWrap: "wrap",
          paddingTop: "var(--space-4)",
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: "0.8125rem",
            color: "var(--color-on-surface-variant)",
            maxWidth: "26rem",
            lineHeight: 1.7,
          }}
        >
          Keeping your profile current helps Shiksha Sathi tailor class and question-bank context to your teaching environment.
        </p>
        <button
          type="submit"
          disabled={isPending}
          className="profile-submit"
          style={{
            padding: "var(--space-3) var(--space-8)",
            border: "none",
            borderRadius: "var(--radius-lg)",
            background:
              "linear-gradient(145deg, var(--color-primary), var(--color-primary-dim))",
            color: "var(--color-on-primary)",
            fontWeight: 700,
            letterSpacing: "0.03em",
            cursor: isPending ? "wait" : "pointer",
            boxShadow: "var(--shadow-sm)",
          }}
        >
          {isPending ? "Saving Profile…" : "Save Profile"}
        </button>
      </div>

      <style>{`
        .profile-input {
          width: 100%;
          background: var(--color-surface-container-highest);
          border: none;
          border-bottom: 1px solid var(--color-outline-variant);
          padding: var(--space-3) 0;
          font-size: 0.9375rem;
          color: var(--color-on-surface);
          outline: none;
          transition: border-color 200ms ease-out;
        }
        .profile-input:focus {
          border-bottom-color: var(--color-primary);
        }
        .profile-submit:hover {
          opacity: 0.92;
          transform: translateY(-1px);
        }
        .profile-submit:active {
          transform: scale(0.98);
        }
      `}</style>
    </form>
  );
}
