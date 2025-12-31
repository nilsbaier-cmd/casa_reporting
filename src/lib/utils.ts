import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Shared chart configuration for consistent styling across components
export const CHART_COLORS = [
  '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE',
  '#1D4ED8', '#1E40AF', '#1E3A8A', '#3730A3', '#4F46E5',
] as const;

export const CHART_TOOLTIP_STYLE = {
  backgroundColor: '#fff',
  border: '1px solid #e5e5e5',
  borderRadius: 0,
} as const;

export const CLASSIFICATION_COLORS = {
  sanction: '#DC2626',   // red
  watchList: '#D97706',  // amber
  clear: '#16A34A',      // green
  unreliable: '#6B7280', // gray
} as const;
