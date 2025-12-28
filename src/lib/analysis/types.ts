// Raw data from INAD Excel file
export interface INADRecord {
  airline: string;      // Fluggesellschaft
  lastStop: string;     // Abflugort (last stop)
  year: number;         // Jahr
  month: number;        // Monat
  refusalCode: string;  // Column 18 (EVGrund)
  included: boolean;    // Not in EXCLUDE_CODES
}

// Raw data from BAZL Excel file
export interface BAZLRecord {
  airline: string;      // Airline Code (IATA)
  airport: string;      // Flughafen (IATA)
  pax: number;          // Passagiere / Passagers
  year: number;         // Jahr
  month: number;        // Monat
}

// Step 1 result: Airline screening
export interface Step1Result {
  airline: string;
  inadCount: number;
  passesThreshold: boolean;
}

// Step 2 result: Route screening
export interface Step2Result {
  airline: string;
  lastStop: string;
  inadCount: number;
  passesThreshold: boolean;
}

// Priority classification
export type Priority = 'HIGH_PRIORITY' | 'WATCH_LIST' | 'UNRELIABLE' | 'CLEAR';

// Step 3 result: Density analysis with priority
export interface Step3Result {
  airline: string;
  lastStop: string;
  inadCount: number;
  pax: number;
  density: number | null;  // INAD per 1000 passengers (permille)
  reliable: boolean;       // PAX >= minPax
  priority: Priority;
}

// Analysis configuration
export interface AnalysisConfig {
  minInad: number;                // Minimum INADs for Step 1/2 (default: 6)
  minPax: number;                 // Minimum PAX for reliable density (default: 5000)
  minDensity: number;             // Minimum density for HIGH_PRIORITY in permille (default: 0.10)
  highPriorityMultiplier: number; // Density must be threshold * this for HIGH_PRIORITY (default: 1.5)
  highPriorityMinInad: number;    // Minimum INADs for HIGH_PRIORITY (default: 10)
}

// Complete analysis results
export interface AnalysisResults {
  step1: Step1Result[];
  step2: Step2Result[];
  step3: Step3Result[];
  threshold: number;
  config: AnalysisConfig;
}
