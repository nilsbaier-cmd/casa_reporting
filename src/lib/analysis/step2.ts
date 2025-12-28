import type { INADRecord, Step1Result, Step2Result } from './types';
import { DEFAULT_CONFIG } from './constants';

/**
 * Step 2 (Prüfstufe 2): Route Screening
 *
 * From airlines passing Step 1, identifies routes with >= minInad INADs.
 * A route is defined as (Airline, LastStop) pair.
 */
export function calculateStep2(
  inadData: INADRecord[],
  step1Results: Step1Result[],
  minInad: number = DEFAULT_CONFIG.minInad
): Step2Result[] {
  // Get set of airlines that passed Step 1
  const passingAirlines = new Set(
    step1Results
      .filter(r => r.passesThreshold)
      .map(r => r.airline)
  );

  // Filter to included records from passing airlines
  const included = inadData.filter(
    r => r.included && passingAirlines.has(r.airline)
  );

  // Group by (airline, lastStop) route and count
  const counts = new Map<string, number>();
  for (const record of included) {
    const key = `${record.airline}|${record.lastStop}`;
    counts.set(key, (counts.get(key) || 0) + 1);
  }

  // Convert to results array with threshold check
  const results: Step2Result[] = Array.from(counts.entries())
    .map(([key, inadCount]) => {
      const [airline, lastStop] = key.split('|');
      return {
        airline,
        lastStop,
        inadCount,
        passesThreshold: inadCount >= minInad,
      };
    })
    .sort((a, b) => b.inadCount - a.inadCount);

  return results;
}

/**
 * Get summary statistics for Step 2
 */
export function getStep2Summary(results: Step2Result[]) {
  const total = results.length;
  const passing = results.filter(r => r.passesThreshold).length;
  const totalInads = results.reduce((sum, r) => sum + r.inadCount, 0);

  return {
    totalRoutes: total,
    passingRoutes: passing,
    totalInads,
  };
}
