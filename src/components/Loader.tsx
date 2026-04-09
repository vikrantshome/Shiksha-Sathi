import React from 'react';

interface LoaderProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  color?: 'primary' | 'on-primary' | 'currentColor';
  label?: string;
  fullScreen?: boolean;
}

/**
 * Standardized Material 3 Loader component.
 */
export default function Loader({ 
  className = '', 
  size = 'md', 
  color = 'primary', 
  label, 
  fullScreen = false 
}: LoaderProps) {
  
  const sizeMap = {
    sm: 16,
    md: 24,
    lg: 48,
  };

  const colorClassMap = {
    primary: 'text-primary',
    'on-primary': 'text-on-primary',
    currentColor: 'text-current',
  };

  const currentSize = sizeMap[size];
  const currentColorClass = colorClassMap[color];

  const content = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <svg
        className={`animate-spin ${currentColorClass}`}
        width={currentSize}
        height={currentSize}
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="status"
        aria-label={label || "Loading"}
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="opacity-25"
        />
        <path
          d="M12 2C6.47715 2 2 6.47715 2 12"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          className="opacity-75"
        />
      </svg>
      {label && (
        <span className={`text-sm font-medium ${currentColorClass} animate-pulse`}>
          {label}
        </span>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-surface/80 backdrop-blur-sm">
        {content}
      </div>
    );
  }

  return content;
}
