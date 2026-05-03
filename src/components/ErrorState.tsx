"use client";

import { useState } from "react";
import Loader from "./Loader";

export type ErrorType = "network" | "not_found" | "server" | "unknown";

interface ErrorStateProps {
  title?: string;
  message?: string;
  type?: ErrorType;
  onRetry?: () => void;
  retryLabel?: string;
}

const errorConfig: Record<ErrorType, { title: string; message: string }> = {
  network: {
    title: "Connection Error",
    message: "Please check your internet connection and try again.",
  },
  not_found: {
    title: "Not Found",
    message: "The requested resource could not be found.",
  },
  server: {
    title: "Server Error",
    message: "Something went wrong on our end. Please try again later.",
  },
  unknown: {
    title: "Something went wrong",
    message: "An unexpected error occurred. Please try again.",
  },
};

export default function ErrorState({
  title,
  message,
  type = "unknown",
  onRetry,
  retryLabel = "Try Again",
}: ErrorStateProps) {
  const [retrying, setRetrying] = useState(false);

  const config = errorConfig[type];
  const displayTitle = title || config.title;
  const displayMessage = message || config.message;

  const handleRetry = async () => {
    if (!onRetry) return;
    setRetrying(true);
    try {
      await onRetry();
    } finally {
      setRetrying(false);
    }
  };

  if (retrying) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader size="lg" label="Retrying..." />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 px-4">
      <div className="text-center max-w-md">
        <div className="mb-4">
          <svg
            width="48"
            height="48"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mx-auto text-error"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-on-surface mb-2">
          {displayTitle}
        </h2>
        <p className="text-on-surface-variant">{displayMessage}</p>
      </div>
      {onRetry && (
        <button
          onClick={handleRetry}
          className="px-4 py-2 rounded-lg font-medium text-white bg-primary hover:bg-primary/90 transition-colors"
        >
          {retryLabel}
        </button>
      )}
    </div>
  );
}