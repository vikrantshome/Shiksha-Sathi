import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility for merging Tailwind CSS classes.
 * Resolves conflicts between clsx conditional classes and Tailwind utilities.
 *
 * @example
 * cn('px-4 py-2', isActive && 'bg-primary text-white', className)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
