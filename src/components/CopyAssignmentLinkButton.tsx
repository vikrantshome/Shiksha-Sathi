"use client";

import { CheckIcon, ClipboardDocumentIcon, LinkIcon, KeyIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useEffect, useState } from "react";

type CopyAssignmentLinkButtonProps = {
  shareLink: string;
  path: string;
  code?: string;
};

export default function CopyAssignmentLinkButton({ shareLink, path, code }: CopyAssignmentLinkButtonProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (!copiedLink) return;
    const timeoutId = window.setTimeout(() => setCopiedLink(false), 1800);
    return () => window.clearTimeout(timeoutId);
  }, [copiedLink]);

  useEffect(() => {
    if (!copiedCode) return;
    const timeoutId = window.setTimeout(() => setCopiedCode(false), 1800);
    return () => window.clearTimeout(timeoutId);
  }, [copiedCode]);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
          setCopiedLink(true);
        }}
        className="inline-flex shrink-0 items-center justify-center gap-2 rounded-sm bg-gradient-to-br from-primary to-primary-dim px-4 py-2.5 text-sm font-medium text-on-primary transition-all duration-150 ease-out hover:opacity-90 hover:shadow-sm active:scale-[0.98]"
      >
        {copiedLink ? <CheckIcon className="h-4 w-4" /> : <ClipboardDocumentIcon className="h-4 w-4" />}
        {copiedLink ? "Copied" : "Copy Link"}
      </button>

      {code && (
        <>
          <div className="min-w-0 flex-1 rounded-md border border-outline-variant/30 bg-primary-container/40 px-3 py-2">
            <div className="mb-1 flex items-center gap-2 text-label-sm text-on-primary-container">
              <KeyIcon className="h-4 w-4" />
              <span>Entry Code</span>
            </div>
            <code className="block break-all font-mono text-lg font-extrabold tracking-[0.2em] text-primary">
              {code}
            </code>
          </div>

          <button
            type="button"
            onClick={async () => {
              await navigator.clipboard.writeText(code);
              setCopiedCode(true);
            }}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-sm bg-gradient-to-br from-primary to-primary-dim px-4 py-2.5 text-sm font-medium text-on-primary transition-all duration-150 ease-out hover:opacity-90 hover:shadow-sm active:scale-[0.98]"
          >
            {copiedCode ? <CheckIcon className="h-4 w-4" /> : <ClipboardDocumentIcon className="h-4 w-4" />}
            {copiedCode ? "Copied" : "Copy Code"}
          </button>
        </>
      )}
    </div>
  );
}
