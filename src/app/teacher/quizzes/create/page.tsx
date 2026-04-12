import { api } from "@/lib/api";
import { redirect } from "next/navigation";
import CreateQuizForm from "@/components/CreateQuizForm";

export const dynamic = "force-dynamic";

export default async function CreateQuizPage() {
  try {
    await api.auth.getMe();
  } catch {
    redirect("/login");
  }

  const classesData = await api.classes.getClasses();

  const classes = classesData.map((item) => ({
    id: item.id,
    name: item.name,
    section: item.section,
  }));

  return (
    <div className="pb-12">
      <header className="mb-8 flex items-end justify-between gap-4 flex-wrap">
        <div className="grid gap-2">
          <p className="m-0 text-label-sm text-on-surface-variant">
            Review &amp; Publish
          </p>
          <h1 className="m-0 font-headline text-[clamp(2rem,4vw,2.75rem)] font-extrabold tracking-[-0.04em] text-primary">
            Finalize Your Quiz
          </h1>
          <p className="text-[0.9375rem] text-on-surface-variant leading-[1.7] max-w-[44rem] m-0">
            Quizzes support <span className="font-semibold">MCQ</span> and <span className="font-semibold">True / False</span> only. Use the Question Bank tray to pick questions, then publish a self‑paced code or start a live session.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full bg-surface-container-low px-3 py-2 text-xs font-bold text-on-surface-variant">
          <span className="h-2 w-2 rounded-full bg-primary" />
          Live + self‑paced
        </span>
      </header>

      <CreateQuizForm classes={classes} />
    </div>
  );
}

