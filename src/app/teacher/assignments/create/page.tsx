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
    <div className="pb-12">
      <header className="mb-8 flex items-end justify-between gap-4 flex-wrap">
        <div className="grid gap-2">
          <p className="m-0 text-label-sm text-on-surface-variant">
            Review &amp; Organize
          </p>
          <h1 className="m-0 font-headline text-[clamp(2rem,4vw,2.75rem)] font-extrabold tracking-[-0.04em] text-primary">
            Finalize Your Assignment
          </h1>
          <p className="text-[0.9375rem] text-on-surface-variant leading-[1.7] max-w-[42rem] m-0">
            Organize the selected question set, confirm the target class, and
            publish the final assignment using the same streamlined flow as the
            question bank.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-3 py-2 text-xs font-bold text-on-surface-variant">
          <span className="h-2 w-2 rounded-full bg-primary" />
          Publish-ready review
        </span>
      </header>

      <CreateAssignmentForm classes={classes} />
    </div>
  );
}
