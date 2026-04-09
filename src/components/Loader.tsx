/**
 * Simple loading spinner component.
 * Usage: <Loader size="md" label="Loading..." />
 */
interface LoaderProps {
  size?: "sm" | "md" | "lg";
  label?: string;
}

const sizeMap = {
  sm: "w-5 h-5",
  md: "w-8 h-8",
  lg: "w-12 h-12",
};

export default function Loader({ size = "md", label }: LoaderProps) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className={`${sizeMap[size]} rounded-full border-2 border-primary/20 border-t-primary animate-spin`}
      />
      {label && (
        <p className="text-sm text-on-surface-variant">{label}</p>
      )}
    </div>
  );
}
