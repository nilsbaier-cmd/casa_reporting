import type { INADRecord, BAZLRecord, AnalysisResults, AnalysisConfig } from './types';
import { DEFAULT_CONFIG } from './constants';
import { calculateStep1 } from './step1';
import { calculateStep2 } from './step2';
import { calculateStep3 } from './step3';

// Re-export everything
export * from './types';
export * from './constants';
export * from './parseExcel';
export { calculateStep1, getStep1Summary } from './step1';
export { calculateStep2, getStep2Summary } from './step2';
export { calculateStep3, getStep3Summary } from './step3';

/**
 * Run the complete 3-step INAD analysis
 */
export function runFullAnalysis(
  inadData: INADRecord[],
  bazlData: BAZLRecord[],
  config: AnalysisConfig = DEFAULT_CONFIG
): AnalysisResults {
  // Step 1: Airline screening
  const step1 = calculateStep1(inadData, config.minInad);

  // Step 2: Route screening
  const step2 = calculateStep2(inadData, step1, config.minInad);

  // Step 3: Density analysis with priority classification
  const { results: step3, threshold } = calculateStep3(step2, bazlData, config);

  return {
    step1,
    step2,
    step3,
    threshold,
    config,
  };
}
