import { api } from "@/lib/api";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import Link from "next/link";

export const dynamic = "force-dynamic";

import { ClassItem } from "@/lib/api/types";

export default async function ClassesPage() {
  let classes: ClassItem[] = [];
  try {
    classes = await api.classes.getClasses();
  } catch (err: unknown) {
    const error = err as { status?: number };
    if (error.status === 401) {
      redirect("/login");
    }
    console.error("Failed to load classes:", err);
  }

  // Handle class creation
  async function handleCreateClass(formData: FormData) {
    "use server";
    const name = formData.get("name") as string;
    const section = formData.get("section") as string;
    const studentCount = parseInt(
      formData.get("studentCount") as string,
      10
    );

    try {
      await api.classes.createClass({ name, section, studentCount });
      revalidatePath("/teacher/classes");
    } catch (error) {
      console.error("Failed to create class:", error);
    }
  }

  // Handle class archival
  async function handleArchiveClass(id: string) {
    "use server";
    try {
      await api.classes.archiveClass(id);
      revalidatePath("/teacher/classes");
    } catch (error) {
      console.error("Failed to archive class:", error);
    }
  }

  // Handle class deletion
  async function handleDeleteClass(id: string) {
    "use server";
    try {
      await api.classes.deleteClass(id);
      revalidatePath("/teacher/classes");
    } catch (error) {
      console.error("Failed to delete class:", error);
    }
  }

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: "var(--space-6)" }}>
        <h1 className="text-display-sm">Classes</h1>
        <p
          className="text-body-md"
          style={{
            color: "var(--color-on-surface-variant)",
            marginTop: "var(--space-1)",
          }}
        >
          Manage your active classes and sections
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Create Class Form */}
        <div
          style={{
            background: "var(--color-surface-container-lowest)",
            padding: "var(--space-6)",
            borderRadius: "var(--radius-md)",
            height: "fit-content",
          }}
        >
          <h2
            className="text-headline-sm"
            style={{ marginBottom: "var(--space-5)" }}
          >
            Create New Class
          </h2>
          <form
            action={handleCreateClass}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "var(--space-4)",
            }}
          >
            <div>
              <label
                className="text-label-md"
                style={{
                  display: "block",
                  color: "var(--color-on-surface-variant)",
                  marginBottom: "var(--space-1-5)",
                }}
              >
                Class Name
              </label>
              <input
                name="name"
                required
                placeholder="e.g. Grade 10 Mathematics"
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
                Section
              </label>
              <input
                name="section"
                required
                placeholder="e.g. A"
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
                Student Count
              </label>
              <input
                name="studentCount"
                type="number"
                min="1"
                required
                placeholder="e.g. 30"
                className="input-academic"
              />
            </div>
            <button
              type="submit"
              className="btn-primary"
              style={{ width: "100%", padding: "var(--space-3)" }}
            >
              Create Class
            </button>
          </form>
        </div>

        {/* Class List */}
        <div
          className="md:col-span-2"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "var(--space-3)",
          }}
        >
          {classes.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "var(--space-12) var(--space-8)",
                background: "var(--color-surface-container-lowest)",
                borderRadius: "var(--radius-md)",
                border: "1px dashed var(--color-outline-variant)",
              }}
            >
              <p
                className="text-body-md"
                style={{ color: "var(--color-on-surface-variant)" }}
              >
                No active classes found. Create your first class to get
                started.
              </p>
            </div>
          ) : (
            classes
              .filter((cls) => cls.active)
              .map((cls) => (
                <div
                  key={cls.id}
                  className="flex justify-between items-center"
                  style={{
                    background: "var(--color-surface-container-lowest)",
                    padding: "var(--space-5)",
                    borderRadius: "var(--radius-md)",
                    transition: "all var(--transition-fast)",
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontWeight: 600,
                        color: "var(--color-on-surface)",
                        fontSize: "0.9375rem",
                      }}
                    >
                      {cls.name}
                    </h3>
                    <p
                      className="text-body-sm"
                      style={{
                        color: "var(--color-on-surface-variant)",
                        marginTop: "2px",
                      }}
                    >
                      Section {cls.section} · {cls.studentCount} Students
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Link
                      href={`/teacher/classes/${cls.id}/attendance`}
                      className="btn-ghost"
                      style={{
                        padding: "var(--space-1-5) var(--space-3)",
                        fontSize: "0.8125rem",
                        background: "var(--color-primary-container)",
                        color: "var(--color-on-primary-container)",
                      }}
                    >
                      Attendance
                    </Link>
                    <form action={handleArchiveClass.bind(null, cls.id)}>
                      <button
                        type="submit"
                        className="btn-ghost"
                        style={{
                          padding: "var(--space-1-5) var(--space-3)",
                          fontSize: "0.8125rem",
                        }}
                      >
                        Archive
                      </button>
                    </form>
                    <form action={handleDeleteClass.bind(null, cls.id)}>
                      <button
                        type="submit"
                        className="btn-ghost"
                        style={{
                          padding: "var(--space-1-5) var(--space-3)",
                          fontSize: "0.8125rem",
                          color: "var(--color-error)",
                        }}
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
