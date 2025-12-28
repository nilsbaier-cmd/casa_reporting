import type { Step2Result, BAZLRecord, Step3Result, Priority, AnalysisConfig } from './types';
import { DEFAULT_CONFIG } from './constants';

/**
 * Calculate median of an array of numbers
 */
function median(values: number[]): number {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[mid - 1] + sorted[mid]) / 2;
  }
  return sorted[mid];
}

/**
 * Build PAX lookup map from BAZL data
 * Key: "airline|airport" -> total PAX
 */
function buildPaxLookup(bazlData: BAZLRecord[]): Map<string, number> {
  const lookup = new Map<string, number>();

  for (const record of bazlData) {
    const key = `${record.airline}|${record.airport}`;
    lookup.set(key, (lookup.get(key) || 0) + record.pax);
  }

  return lookup;
}

/**
 * Step 3 (Prüfstufe 3): INAD Density Analysis with Priority Classification
 *
 * For routes passing Step 2:
 * 1. Look up PAX from BAZL data
 * 2. Calculate density = (INAD / PAX) * 1000 (permille)
 * 3. Calculate threshold as median of reliable densities
 * 4. Classify priority based on density vs threshold
 */
export function calculateStep3(
  step2Results: Step2Result[],
  bazlData: BAZLRecord[],
  config: AnalysisConfig = DEFAULT_CONFIG
): { results: Step3Result[]; threshold: number } {
  // Build PAX lookup
  const paxLookup = buildPaxLookup(bazlData);

  // Get routes that passed Step 2 threshold
  const passingRoutes = step2Results.filter(r => r.passesThreshold);

  // Calculate density for each route
  const results: Step3Result[] = passingRoutes.map(route => {
    const key = `${route.airline}|${route.lastStop}`;
    const pax = paxLookup.get(key) || 0;

    // Determine reliability based on PAX volume
    const reliable = pax >= config.minPax;

    // Calculate density (INAD per 1000 passengers)
    const density = pax > 0 ? (route.inadCount / pax) * 1000 : null;

    return {
      airline: route.airline,
      lastStop: route.lastStop,
      inadCount: route.inadCount,
      pax,
      density,
      reliable,
      priority: 'CLEAR' as Priority, // Will be set below
    };
  });

  // Calculate threshold from reliable densities only
  const reliableDensities = results
    .filter(r => r.reliable && r.density !== null)
    .map(r => r.density as number);

  const threshold = reliableDensities.length > 0 ? median(reliableDensities) : 0;

  // Classify priorities based on threshold
  for (const result of results) {
    result.priority = classifyPriority(result, threshold, config);
  }

  // Sort by priority (HIGH_PRIORITY first), then by density descending
  const priorityOrder: Record<Priority, number> = {
    HIGH_PRIORITY: 0,
    WATCH_LIST: 1,
    UNRELIABLE: 2,
    CLEAR: 3,
  };

  results.sort((a, b) => {
    const orderDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (orderDiff !== 0) return orderDiff;
    return (b.density || 0) - (a.density || 0);
  });

  return { results, threshold };
}

/**
 * Classify a route's priority based on its metrics
 */
function classifyPriority(
  result: Step3Result,
  threshold: number,
  config: AnalysisConfig
): Priority {
  // No density means unreliable
  if (result.density === null) {
    return 'UNRELIABLE';
  }

  // Low PAX means unreliable
  if (!result.reliable) {
    return 'UNRELIABLE';
  }

  const density = result.density;

  // Check all HIGH_PRIORITY conditions:
  // 1. Density >= threshold * multiplier
  // 2. Density >= minimum density
  // 3. INAD count >= minimum for high priority
  const aboveThresholdMultiplied = density >= threshold * config.highPriorityMultiplier;
  const aboveMinDensity = density >= config.minDensity;
  const hasEnoughInads = result.inadCount >= config.highPriorityMinInad;

  if (aboveThresholdMultiplied && aboveMinDensity && hasEnoughInads) {
    return 'HIGH_PRIORITY';
  }

  // Check WATCH_LIST: just above threshold
  if (density >= threshold) {
    return 'WATCH_LIST';
  }

  // Below threshold = CLEAR
  return 'CLEAR';
}

/**
 * Get summary statistics for Step 3
 */
export function getStep3Summary(results: Step3Result[], threshold: number) {
  const total = results.length;
  const highPriority = results.filter(r => r.priority === 'HIGH_PRIORITY').length;
  const watchList = results.filter(r => r.priority === 'WATCH_LIST').length;
  const unreliable = results.filter(r => r.priority === 'UNRELIABLE').length;
  const clear = results.filter(r => r.priority === 'CLEAR').length;

  return {
    totalRoutes: total,
    highPriority,
    watchList,
    unreliable,
    clear,
    threshold,
  };
}
