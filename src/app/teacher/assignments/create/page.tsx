import { api } from "@/lib/api";
import CreateAssignmentForm from "@/components/CreateAssignmentForm";
import { ClassItem } from "@/lib/api/types";

export const dynamic = "force-dynamic";

export default async function CreateAssignmentPage() {
  const classesData = await api.classes.getClasses();

  const classes = classesData.map((item: ClassItem) => ({
    id: item.id,
    name: item.name,
    section: item.section,
  }));

  return (
    <div style={{ paddingBottom: "var(--space-12)" }}>
      <header
        style={{
          display: "grid",
          gap: "var(--space-4)",
          marginBottom: "var(--space-8)",
        }}
      >
        <div>
          <p className="text-label-sm" style={{ color: "var(--color-on-surface-variant)", margin: 0 }}>
            Review &amp; Organize
          </p>
          <h1
            style={{
              fontFamily: "var(--font-manrope), system-ui, sans-serif",
              fontSize: "clamp(2rem, 4vw, 2.75rem)",
              fontWeight: 800,
              letterSpacing: "-0.04em",
              color: "var(--color-primary)",
              margin: "var(--space-2) 0 0",
            }}
          >
            Finalize Your Assignment
          </h1>
        </div>

        <p
          style={{
            color: "var(--color-on-surface-variant)",
            fontSize: "0.9375rem",
            lineHeight: 1.7,
            maxWidth: "42rem",
            margin: 0,
          }}
        >
          Use the selected question set to build a precise student assignment. This flow stays link-based and Shiksha Sathi-native, matching the refined Stitch publish journey.
        </p>
      </header>

      <CreateAssignmentForm classes={classes} />
    </div>
  );
}
