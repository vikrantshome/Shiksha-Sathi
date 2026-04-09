import Loader from "@/components/Loader";

export default function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <Loader size="lg" label="Loading dashboard..." />
    </div>
  );
}
