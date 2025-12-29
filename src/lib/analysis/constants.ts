import type { AnalysisConfig } from './types';

// Refusal codes that are excluded from INAD count
// These represent administrative issues, not actual carrier performance problems
export const EXCLUDE_CODES = new Set([
  'B1n', 'B2n', 'C4n', 'C5n', 'C8',
  'D1n', 'D2n', 'E', 'F1n', 'G', 'H', 'I'
]);

// Default analysis configuration
export const DEFAULT_CONFIG: AnalysisConfig = {
  minInad: 6,                   // Minimum INADs for Steps 1 & 2
  minPax: 5000,                 // Minimum PAX for reliable density calculation
  minDensity: 0.10,             // Minimum density (‰) for HIGH_PRIORITY
  highPriorityMultiplier: 1.5,  // Must be 1.5× threshold for HIGH_PRIORITY
  highPriorityMinInad: 10,      // Must have 10+ INADs for HIGH_PRIORITY
};

// Excel column mappings for INAD file
export const INAD_COLUMNS = {
  airline: 'Fluggesellschaft',
  lastStop: 'Abflugort (last stop)',
  year: 'Jahr',
  month: 'Monat',
  refusalCodeIndex: 18,  // Column S (0-indexed: 18)
} as const;

// Excel column mappings for BAZL file
// Note: Using ICAO codes as IATA columns are often empty in the source data
export const BAZL_COLUMNS = {
  airline: 'Airline Code (ICAO)',
  airport: 'Flughafen (ICAO)',
  pax: 'Passagiere / Passagers',
  year: 'Jahr',
  month: 'Monat',
} as const;

// Sheet names
export const SHEET_NAMES = {
  inad: 'INAD-Tabelle',
  bazl: 'BAZL-Daten',
} as const;

// Priority colors for UI
export const PRIORITY_COLORS = {
  HIGH_PRIORITY: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-200',
  },
  WATCH_LIST: {
    bg: 'bg-orange-100',
    text: 'text-orange-800',
    border: 'border-orange-200',
  },
  UNRELIABLE: {
    bg: 'bg-slate-100',
    text: 'text-slate-600',
    border: 'border-slate-200',
  },
  CLEAR: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-200',
  },
} as const;

// Priority labels for display
export const PRIORITY_LABELS = {
  HIGH_PRIORITY: 'High Priority',
  WATCH_LIST: 'Watch List',
  UNRELIABLE: 'Unreliable Data',
  CLEAR: 'Clear',
} as const;
