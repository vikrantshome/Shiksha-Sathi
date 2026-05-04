"use client";

export default function SkeletonLoader({ className = "" }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-surface-container rounded-lg ${className}`} />
  );
}

export function QuizSettingsSkeleton() {
  return (
    <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-surface-container" />
        <div className="space-y-2">
          <SkeletonLoader className="h-5 w-32" />
          <SkeletonLoader className="h-3 w-24" />
        </div>
      </div>

      {/* Fields */}
      <div className="space-y-5">
        <div className="space-y-2">
          <SkeletonLoader className="h-4 w-20" />
          <SkeletonLoader className="h-12 w-full rounded-xl" />
        </div>
        <div className="space-y-2">
          <SkeletonLoader className="h-4 w-20" />
          <SkeletonLoader className="h-12 w-full rounded-xl" />
        </div>
        <div className="space-y-2">
          <SkeletonLoader className="h-4 w-28" />
          <SkeletonLoader className="h-12 w-full rounded-xl" />
        </div>
        <div className="pt-4">
          <div className="flex items-center gap-3">
            <SkeletonLoader className="w-5 h-5 rounded" />
            <SkeletonLoader className="h-4 w-48" />
          </div>
        </div>
      </div>

      {/* Button */}
      <SkeletonLoader className="h-12 w-full rounded-xl" />
    </div>
  );
}

export function QuestionReviewSkeleton() {
  return (
    <div className="rounded-2xl border border-outline-variant/20 bg-surface-container-lowest p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <SkeletonLoader className="h-5 w-32" />
        <div className="flex gap-2">
          <SkeletonLoader className="h-6 w-20 rounded-full" />
          <SkeletonLoader className="h-6 w-16 rounded-full" />
        </div>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-3 gap-2">
        <SkeletonLoader className="h-16 rounded-xl" />
        <SkeletonLoader className="h-16 rounded-xl" />
        <SkeletonLoader className="h-16 rounded-xl" />
      </div>

      {/* Question Cards */}
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-3 p-3 border border-outline-variant/10 rounded-xl">
            <SkeletonLoader className="w-6 h-6 rounded-full" />
            <div className="flex-1 space-y-2">
              <SkeletonLoader className="h-4 w-full" />
              <SkeletonLoader className="h-3 w-2/3" />
            </div>
          </div>
        ))}
      </div>

      {/* Add More Button */}
      <SkeletonLoader className="h-12 w-full rounded-xl" />
    </div>
  );
}