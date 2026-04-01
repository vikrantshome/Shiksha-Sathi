"use client";

import Link from "next/link";
import { ArchiveBoxIcon, TrashIcon } from "@heroicons/react/24/outline";

interface ClassActionButtonsProps {
  archiveAction?: () => Promise<void>;
  deleteAction: () => Promise<void>;
  attendanceHref?: string;
  className: string;
}

export default function ClassActionButtons({
  archiveAction,
  deleteAction,
  attendanceHref,
  className,
}: ClassActionButtonsProps) {
  const confirmArchive = (event: React.FormEvent<HTMLFormElement>) => {
    if (
      !window.confirm(
        `Archive "${className}"?\n\nYou can still find it under Archived Classes later.`
      )
    ) {
      event.preventDefault();
    }
  };

  const confirmDelete = (event: React.FormEvent<HTMLFormElement>) => {
    if (
      !window.confirm(
        `Delete "${className}" permanently?\n\nThis cannot be undone.`
      )
    ) {
      event.preventDefault();
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {attendanceHref && (
        <Link
          href={attendanceHref}
          className="btn-ghost bg-surface-container-high text-primary"
        >
          View Attendance
        </Link>
      )}

      {archiveAction && (
        <form action={archiveAction} onSubmit={confirmArchive}>
          <button
            type="submit"
            className="p-2 text-on-surface-variant hover:text-on-surface hover:bg-surface-container rounded-full transition-colors"
            title="Archive Class"
          >
            <ArchiveBoxIcon className="w-5 h-5" />
          </button>
        </form>
      )}

      <form action={deleteAction} onSubmit={confirmDelete}>
        <button
          type="submit"
          className="p-2 text-on-surface-variant hover:text-error hover:bg-error-container rounded-full transition-colors"
          title="Delete Class"
        >
          <TrashIcon className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
