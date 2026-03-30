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
      <header className="grid gap-4 mb-8">
        <div>
          <p className="text-label-sm text-on-surface-variant m-0">
            Review &amp; Organize
          </p>
          <h1 className="font-headline text-[clamp(2rem,4vw,2.75rem)] font-extrabold tracking-[-0.04em] text-primary mt-2 mb-0">
            Finalize Your Assignment
          </h1>
        </div>

        <p className="text-[0.9375rem] text-on-surface-variant leading-[1.7] max-w-[42rem] m-0">
          Use the selected question set to build a precise student assignment.
          This flow stays link-based and Shiksha Sathi-native, matching the
          refined Stitch publish journey.
        </p>
      </header>

      <CreateAssignmentForm classes={classes} />
    </div>
  );
}
