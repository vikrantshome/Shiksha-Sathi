export default function Loading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
      <div className="bg-surface-container-low p-5 md:p-6 lg:p-8 rounded-xl h-fit animate-pulse">
        <div className="h-6 w-32 bg-surface-container rounded mb-6"></div>
        <div className="flex flex-col gap-5">
          <div className="h-10 bg-surface-container rounded"></div>
          <div className="h-10 bg-surface-container rounded"></div>
          <div className="h-10 bg-surface-container rounded"></div>
          <div className="h-10 bg-surface-container rounded"></div>
        </div>
      </div>
      <div className="md:col-span-2">
        <div className="h-8 w-40 bg-surface-container rounded mb-4 animate-pulse"></div>
        <div className="bg-surface-container-lowest rounded-lg p-4">
          <div className="h-12 bg-surface-container rounded mb-3"></div>
          <div className="h-12 bg-surface-container rounded mb-3"></div>
          <div className="h-12 bg-surface-container rounded"></div>
        </div>
      </div>
    </div>
  );
}