export default function Loading() {
  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-surface)] animate-pulse">
      {/* ═══ Header Skeleton ═══ */}
      <div className="px-6 py-8 border-b border-[var(--color-outline-variant)]">
        <div className="h-4 w-24 bg-[var(--color-surface-container-highest)] rounded mb-3"></div>
        <div className="h-8 w-64 bg-[var(--color-surface-container-highest)] rounded"></div>
      </div>

      {/* ═══ Main Workspace Skeleton ═══ */}
      <div className="flex flex-1 overflow-hidden flex-col lg:flex-row">
        
        {/* Left Sidebar (Filters) */}
        <aside className="w-full lg:w-72 lg:shrink-0 border-r border-[var(--color-outline-variant)] p-6 hidden md:block bg-[var(--color-surface-container-lowest)]">
          <div className="h-5 w-20 bg-[var(--color-surface-container-highest)] rounded mb-6"></div>
          
          {/* Filter dropdown skeletons */}
          <div className="space-y-6">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i}>
                <div className="h-3 w-16 bg-[var(--color-surface-container-high)] rounded mb-2"></div>
                <div className="h-10 w-full bg-[var(--color-surface-container)] rounded-lg"></div>
              </div>
            ))}
          </div>
        </aside>

        {/* Center Panel (Search & Results) */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {/* Search Bar Skeleton */}
          <div className="mb-6 flex gap-4">
            <div className="h-12 flex-1 bg-[var(--color-surface-container)] rounded-full"></div>
            <div className="h-12 w-24 bg-[var(--color-surface-container)] rounded-full hidden sm:block"></div>
          </div>

          {/* Results Summary Skeleton */}
          <div className="flex justify-between items-center mb-6">
            <div className="h-4 w-32 bg-[var(--color-surface-container-highest)] rounded"></div>
            <div className="h-8 w-24 bg-[var(--color-surface-container)] rounded-full"></div>
          </div>

          {/* Question Cards Skeleton */}
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="p-6 rounded-2xl border border-[var(--color-outline-variant)] bg-[var(--color-surface-container-lowest)]">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-2">
                    <div className="h-6 w-16 bg-[var(--color-surface-container-high)] rounded-full"></div>
                    <div className="h-6 w-20 bg-[var(--color-surface-container-high)] rounded-full"></div>
                  </div>
                  <div className="h-6 w-12 bg-[var(--color-surface-container-high)] rounded-full"></div>
                </div>
                
                {/* Question Text */}
                <div className="space-y-2 mb-6">
                  <div className="h-4 w-full bg-[var(--color-surface-container-highest)] rounded"></div>
                  <div className="h-4 w-5/6 bg-[var(--color-surface-container-highest)] rounded"></div>
                  <div className="h-4 w-3/4 bg-[var(--color-surface-container-highest)] rounded"></div>
                </div>

                {/* Question Options/Input area */}
                <div className="space-y-3 pl-4 border-l-2 border-[var(--color-surface-container-high)]">
                  <div className="h-3 w-1/2 bg-[var(--color-surface-container)] rounded"></div>
                  <div className="h-3 w-2/3 bg-[var(--color-surface-container)] rounded"></div>
                  <div className="h-3 w-1/3 bg-[var(--color-surface-container)] rounded"></div>
                </div>

                {/* Footer / Actions */}
                <div className="mt-6 flex justify-end">
                  <div className="h-8 w-32 bg-[var(--color-surface-container-highest)] rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </main>

        {/* Right Sidebar (Assignment Tray) */}
        <aside className="w-80 shrink-0 border-l border-[var(--color-outline-variant)] bg-[var(--color-surface-container-low)] hidden xl:block p-6">
          <div className="h-6 w-32 bg-[var(--color-surface-container-highest)] rounded mb-2"></div>
          <div className="h-4 w-48 bg-[var(--color-surface-container)] rounded mb-8"></div>
          
          <div className="h-32 w-full bg-[var(--color-surface-container)] rounded-xl mb-6 border border-dashed border-[var(--color-outline-variant)]"></div>
          <div className="h-12 w-full bg-[var(--color-surface-container-highest)] rounded-full"></div>
        </aside>

      </div>
    </div>
  );
}
