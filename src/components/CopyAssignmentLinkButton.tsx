"use client";

import { CheckIcon, ClipboardDocumentIcon, LinkIcon, KeyIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { useEffect, useState } from "react";

type CopyAssignmentLinkButtonProps = {
  shareLink: string;
  path: string;
  code?: string;
};

/* ── Material Design 3 Tonal Button ── */
const TonalButton = ({
  children,
  onClick,
  copied,
}: {
  children: React.ReactNode;
  onClick: () => void;
  copied: boolean;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-bold transition-all duration-200 ease-out active:scale-[0.96] hover:shadow-sm"
    style={{
      background: copied
        ? "var(--color-tertiary-container)"
        : "var(--color-primary-container)",
      color: copied
        ? "var(--color-on-tertiary-container)"
        : "var(--color-on-primary-container)",
    }}
  >
    {copied ? (
      <CheckIcon className="h-4 w-4" />
    ) : (
      <ClipboardDocumentIcon className="h-4 w-4" />
    )}
    {copied ? "Copied" : children}
  </button>
);

export default function CopyAssignmentLinkButton({
  shareLink,
  path,
  code,
}: CopyAssignmentLinkButtonProps) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  useEffect(() => {
    if (!copiedLink) return;
    const timeoutId = window.setTimeout(() => setCopiedLink(false), 2000);
    return () => window.clearTimeout(timeoutId);
  }, [copiedLink]);

  useEffect(() => {
    if (!copiedCode) return;
    const timeoutId = window.setTimeout(() => setCopiedCode(false), 2000);
    return () => window.clearTimeout(timeoutId);
  }, [copiedCode]);

  return (
    <div
      className="rounded-xl p-4 flex flex-col md:flex-row gap-4 md:gap-0 md:items-center"
      style={{
        background: "var(--color-surface-container-lowest)",
        border: "1px solid var(--color-outline-variant)",
      }}
    >
      {/* ═══ Student Link ═══ */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{
            background: "var(--color-primary-container)",
            color: "var(--color-on-primary-container)",
          }}
        >
          <LinkIcon className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <p
            className="text-[0.6875rem] font-bold uppercase tracking-wider mb-0.5"
            style={{ color: "var(--color-on-surface-variant)" }}
          >
            Student Link
          </p>
          <Link
            href={path}
            className="block truncate font-mono text-xs transition hover:opacity-80"
            style={{ color: "var(--color-primary)" }}
            target="_blank"
            rel="noreferrer"
          >
            {shareLink}
          </Link>
        </div>

        <TonalButton
          onClick={async () => {
            await navigator.clipboard.writeText(shareLink);
            setCopiedLink(true);
          }}
          copied={copiedLink}
        >
          Copy Link
        </TonalButton>
      </div>

      {/* ═══ Divider ═══ */}
      {code && (
        <div
          className="h-px w-full md:w-px md:h-10 md:mx-4"
          style={{ background: "var(--color-outline-variant)" }}
        />
      )}

      {/* ═══ Entry Code ═══ */}
      {code && (
        <div className="flex items-center gap-3 flex-1 min-w-0">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: "var(--color-tertiary-container)",
              color: "var(--color-on-tertiary-container)",
            }}
          >
            <KeyIcon className="h-5 w-5" />
          </div>

          <div className="flex-1 min-w-0">
            <p
              className="text-[0.6875rem] font-bold uppercase tracking-wider mb-0.5"
              style={{ color: "var(--color-on-surface-variant)" }}
            >
              Entry Code
            </p>
            <code
              className="block font-mono text-xl font-extrabold tracking-[0.15em]"
              style={{ color: "var(--color-on-surface)" }}
            >
              {code}
            </code>
          </div>

          <TonalButton
            onClick={async () => {
              await navigator.clipboard.writeText(code);
              setCopiedCode(true);
            }}
            copied={copiedCode}
          >
            Copy Code
          </TonalButton>
        </div>
      )}
    </div>
  );
}
