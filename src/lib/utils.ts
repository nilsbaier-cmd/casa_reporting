import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ---------------------------------------------------------------------------
// Chart theme — single source of truth for every recharts visualization.
// All values are Tailwind palette colors, so charts stay consistent with the
// badges, cards and text that use the same palette via utility classes.
// Admin charts are red-accented, viewer charts blue-accented.
// ---------------------------------------------------------------------------

/** Portal accent colors (red-600 / blue-600) */
export const PORTAL_ACCENT = {
  red: '#DC2626',
  blue: '#2563EB',
} as const;

/** Sequential blue scale for categorical viewer charts (top 10 etc.) */
export const CHART_COLORS = [
  '#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE',
  '#1D4ED8', '#1E40AF', '#1E3A8A', '#3730A3', '#4F46E5',
] as const;

/** Sequential red scale for categorical admin charts, mirrors CHART_COLORS */
export const CHART_COLORS_RED = [
  '#DC2626', '#EF4444', '#F87171', '#FCA5A5', '#FECACA',
  '#B91C1C', '#991B1B', '#7F1D1D', '#BE123C', '#E11D48',
] as const;

export const CHART_TOOLTIP_STYLE = {
  backgroundColor: '#fff',
  border: '1px solid #e5e5e5',
  borderRadius: 0,
} as const;

/** Axis tick styling shared by all charts (neutral-500) */
export const CHART_AXIS_TICK = { fontSize: 11, fill: '#737373' } as const;

/** Grid line color shared by all charts (neutral-200) */
export const CHART_GRID_STROKE = '#e5e5e5';

/** Neutral reference-line color (neutral-600), e.g. for the median marker */
export const CHART_REFERENCE_NEUTRAL = '#525252';

/** Saturated classification accents (red-600 / amber-600 / green-600) —
 *  use for text, icons, strokes and small color chips. */
export const CLASSIFICATION_COLORS = {
  sanction: '#DC2626',
  watchList: '#D97706',
  clear: '#16A34A',
} as const;

/** Classification colors for large filled areas (bars, segments): pale
 *  200-shade fill with the saturated 600-shade stroke, mirroring how the
 *  badge components pair a pale background with a strong border. */
export const CLASSIFICATION_BAR_COLORS = {
  sanction: { fill: '#FECACA', stroke: '#DC2626' },
  watchList: { fill: '#FDE68A', stroke: '#D97706' },
  clear: { fill: '#BBF7D0', stroke: '#16A34A' },
} as const;

/** Included vs. excluded INAD split (red-600 / neutral-500) */
export const INAD_SPLIT_COLORS = {
  included: '#DC2626',
  excluded: '#737373',
} as const;
