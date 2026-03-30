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

  return (
    <div style={{ maxWidth: "72rem", margin: "0 auto", paddingBottom: "var(--space-12)" }}>
      <section style={{ marginBottom: "var(--space-10)" }}>
        <p className="text-label-sm" style={{ color: "var(--color-on-surface-variant)", margin: 0 }}>
          Teacher Profile
        </p>
        <h1
          style={{
            fontFamily: "var(--font-manrope), system-ui, sans-serif",
            fontSize: "clamp(2rem, 4vw, 2.5rem)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            color: "var(--color-primary)",
            margin: "var(--space-2) 0 0",
          }}
        >
          Your Profile
        </h1>
        <p
          style={{
            fontSize: "0.9375rem",
            color: "var(--color-on-surface-variant)",
            lineHeight: 1.7,
            margin: "var(--space-3) 0 0",
            maxWidth: "42rem",
          }}
        >
          Personalize your Shiksha Sathi workspace by keeping your school and board context current. This keeps classes, assignments, and question-bank recommendations grounded in your teaching reality.
        </p>
      </section>

      {errorState ? (
        <div
          style={{
            marginBottom: "var(--space-6)",
            padding: "var(--space-4)",
            borderRadius: "var(--radius-md)",
            background: "rgba(168, 56, 54, 0.08)",
            color: "var(--color-error)",
            fontSize: "0.875rem",
          }}
        >
          Error loading profile data. You can still update your details below and try saving again.
        </div>
      ) : null}

      <div className="profile-layout-grid" style={{ display: "grid", gap: "var(--space-8)" }}>
        <div>
          <ProfileForm initialData={initialData} />
        </div>

        <aside style={{ display: "grid", gap: "var(--space-6)" }}>
          <section
            style={{
              background: "var(--color-primary-container)",
              borderRadius: "var(--radius-lg)",
              padding: "var(--space-6)",
            }}
          >
            <p className="text-label-sm" style={{ color: "var(--color-on-primary-container)", margin: 0 }}>
              Profile Strength
            </p>
            <div
              style={{
                width: "100%",
                height: "0.5rem",
                background: "rgba(255, 255, 255, 0.35)",
                borderRadius: "9999px",
                overflow: "hidden",
                marginTop: "var(--space-4)",
              }}
            >
              <div
                style={{
                  width: `${initialData.school && initialData.board ? 100 : initialData.name ? 66 : 33}%`,
                  height: "100%",
                  background: "var(--color-primary)",
                  borderRadius: "9999px",
                }}
              />
            </div>
            <p
              style={{
                margin: "var(--space-3) 0 0",
                fontSize: "0.8125rem",
                lineHeight: 1.7,
                color: "var(--color-on-primary-container)",
              }}
            >
              Complete school and board context so your teaching workspace stays aligned with the right curriculum signals.
            </p>
          </section>

          <section
            style={{
              background: "var(--color-tertiary-container)",
              borderRadius: "var(--radius-lg)",
              padding: "var(--space-6)",
            }}
          >
            <p className="text-label-sm" style={{ color: "#311305", margin: 0 }}>
              Teacher Insight
            </p>
            <p
              style={{
                margin: "var(--space-3) 0 0",
                fontSize: "0.875rem",
                lineHeight: 1.7,
                color: "#311305",
              }}
            >
              Teachers with clear board alignment move faster from question selection to assignment publication because the workspace can narrow content sooner.
            </p>
          </section>
        </aside>
      </div>

      <style>{`
        .profile-layout-grid {
          grid-template-columns: 1fr;
        }
        @media (min-width: 1024px) {
          .profile-layout-grid {
            grid-template-columns: minmax(0, 2fr) minmax(18rem, 24rem);
            align-items: start;
          }
        }
      `}</style>
    </div>
  );
}
