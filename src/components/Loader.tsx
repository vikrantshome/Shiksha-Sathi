interface LoaderProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  color?: string;
}

const sizeMap = {
  sm: 'w-6 h-6',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
};

export default function Loader({ size = 'md', label, color }: LoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <div
        className={`${sizeMap[size]} rounded-full border-2 border-primary/20 animate-spin`}
        style={color ? { borderTopColor: color } : undefined}
        role="status"
        aria-label={label || 'Loading'}
      />
      {label && (
        <p className="text-sm text-on-surface-variant">{label}</p>
      )}
    </div>
  );
}
