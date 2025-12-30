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

export interface PublishedData {
  metadata: PublishedMetadata;
  summary: PublishedSummary;
  airlines: PublishedAirline[];
  routes: PublishedRoute[];
  trends: PublishedTrendData[];
  top10: PublishedTop10;
}
