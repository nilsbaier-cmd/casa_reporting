// Types for published/aggregated data that is shared with external viewers
// This data structure contains NO raw data, only aggregated results

export interface PublishedMetadata {
  publishedAt: string; // ISO timestamp
  semester: string; // e.g., "2024 H2"
  semesterRange: {
    startMonth: number;
    endMonth: number;
    year: number;
  };
  version: string;
}

export interface PublishedSummary {
  totalInads: number;
  totalPax: number;
  airlinesAnalyzed: number;
  airlinesAboveThreshold: number;
  routesAnalyzed: number;
  routesAboveThreshold: number;
  medianDensity: number;
}

export interface PublishedRoute {
  airline: string;
  airlineName: string;
  lastStop: string;
  inadCount: number;
  pax: number;
  density: number | null;
  classification: 'sanction' | 'watchList' | 'clear' | 'unreliable';
}

export interface PublishedAirline {
  airline: string;
  airlineName: string;
  inadCount: number;
  aboveThreshold: boolean;
}

export interface PublishedTrendData {
  semester: string;
  inadCount: number;
  paxCount: number;
  density: number | null;
}

export interface PublishedTop10 {
  lastStops: { name: string; count: number }[];
  airlines: { code: string; name: string; count: number }[];
}

export interface PublishedClassificationConfig {
  minInad: number;           // Minimum INADs for Steps 1 & 2
  minPax: number;            // Minimum PAX for reliable density calculation
  minDensity: number;        // Minimum density (permille) for HIGH_PRIORITY
  highPriorityMultiplier: number;  // Must be X times threshold for HIGH_PRIORITY
  highPriorityMinInad: number;     // Must have X+ INADs for HIGH_PRIORITY
}

export interface PublishedData {
  metadata: PublishedMetadata;
  summary: PublishedSummary;
  airlines: PublishedAirline[];
  routes: PublishedRoute[];
  trends: PublishedTrendData[];
  top10: PublishedTop10;
  classificationConfig?: PublishedClassificationConfig;  // Optional for backward compatibility
}
