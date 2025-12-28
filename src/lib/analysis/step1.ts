import type { INADRecord, Step1Result } from './types';
import { DEFAULT_CONFIG } from './constants';

/**
 * Step 1 (Prüfstufe 1): Airline Screening
 *
 * Identifies airlines with >= minInad INADs in the analysis period.
 * Only counts records where included === true (excluded codes filtered out).
 */
export function calculateStep1(
  inadData: INADRecord[],
  minInad: number = DEFAULT_CONFIG.minInad
): Step1Result[] {
  // Filter to included records only
  const included = inadData.filter(r => r.included);

  // Group by airline and count
  const counts = new Map<string, number>();
  for (const record of included) {
    counts.set(record.airline, (counts.get(record.airline) || 0) + 1);
  }

  // Convert to results array with threshold check
  const results: Step1Result[] = Array.from(counts.entries())
    .map(([airline, inadCount]) => ({
      airline,
      inadCount,
      passesThreshold: inadCount >= minInad,
    }))
    .sort((a, b) => b.inadCount - a.inadCount);

  return results;
}

/**
 * Get summary statistics for Step 1
 */
export function getStep1Summary(results: Step1Result[]) {
  const total = results.length;
  const passing = results.filter(r => r.passesThreshold).length;
  const totalInads = results.reduce((sum, r) => sum + r.inadCount, 0);

  return {
    totalAirlines: total,
    passingAirlines: passing,
    totalInads,
  };
}
