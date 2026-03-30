"use client";

import { CheckIcon, ClipboardDocumentIcon, LinkIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useEffect, useState } from "react";

type CopyAssignmentLinkButtonProps = {
  shareLink: string;
  path: string;
};

export default function CopyAssignmentLinkButton({ shareLink, path }: CopyAssignmentLinkButtonProps) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timeoutId = window.setTimeout(() => setCopied(false), 1800);
    return () => window.clearTimeout(timeoutId);
  }, [copied]);

  return (
    <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0 flex-1 rounded-md border border-outline-variant/30 bg-surface-container/60 px-3 py-2">
        <div className="mb-1 flex items-center gap-2 text-label-sm text-on-surface-variant">
          <LinkIcon className="h-4 w-4" />
          <span>Student Link</span>
        </div>
        <Link
          href={path}
          className="block break-all font-mono text-xs text-primary underline-offset-4 transition hover:underline"
          target="_blank"
          rel="noreferrer"
        >
          {shareLink}
        </Link>
      </div>

      <button
        type="button"
        onClick={async () => {
          await navigator.clipboard.writeText(shareLink);
          setCopied(true);
        }}
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-sm bg-gradient-to-br from-primary to-primary-dim px-4 py-2.5 text-sm font-medium text-on-primary transition-all duration-150 ease-out hover:opacity-90 hover:shadow-sm active:scale-[0.98]"
      >
        {copied ? <CheckIcon className="h-4 w-4" /> : <ClipboardDocumentIcon className="h-4 w-4" />}
        {copied ? "Copied" : "Copy Link"}
      </button>
    </div>
  );
}
