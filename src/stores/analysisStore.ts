import { create } from 'zustand';
import type {
  INADRecord,
  BAZLRecord,
  Step1Result,
  Step2Result,
  Step3Result,
  AnalysisConfig,
} from '@/lib/analysis/types';
import { DEFAULT_CONFIG, runFullAnalysis } from '@/lib/analysis';

// Semester type: e.g., "2024 H1" (Jan-Jun), "2024 H2" (Jul-Dec)
export interface Semester {
  year: number;
  half: 1 | 2;
  label: string;
}

// Helper to get semester from year/month
function getSemester(year: number, month: number): Semester {
  const half = month <= 6 ? 1 : 2;
  return {
    year,
    half,
    label: `${year} H${half}`,
  };
}

// Filter records by semester
function filterBySemester<T extends { year: number; month: number }>(
  records: T[],
  semester: Semester
): T[] {
  const startMonth = semester.half === 1 ? 1 : 7;
  const endMonth = semester.half === 1 ? 6 : 12;

  return records.filter(
    (r) => r.year === semester.year && r.month >= startMonth && r.month <= endMonth
  );
}

// Extract available semesters from BOTH INAD and BAZL data
// This ensures all semesters with data from either source are available
function extractAllSemesters(
  inadData: { year: number; month: number }[] | null,
  bazlData: { year: number; month: number }[] | null
): Semester[] {
  const semesterSet = new Set<string>();

  // Add semesters from INAD data
  if (inadData) {
    for (const record of inadData) {
      const sem = getSemester(record.year, record.month);
      semesterSet.add(sem.label);
    }
  }

  // Add semesters from BAZL data
  if (bazlData) {
    for (const record of bazlData) {
      const sem = getSemester(record.year, record.month);
      semesterSet.add(sem.label);
    }
  }

  // Convert back to Semester objects and sort descending
  const semesters: Semester[] = Array.from(semesterSet).map((label) => {
    const [yearStr, halfStr] = label.split(' H');
    return {
      year: parseInt(yearStr),
      half: parseInt(halfStr) as 1 | 2,
      label,
    };
  });

  // Sort by year desc, then half desc
  semesters.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.half - a.half;
  });

  return semesters;
}

interface AnalysisState {
  // Raw data from files
  inadData: INADRecord[] | null;
  bazlData: BAZLRecord[] | null;

  // File info
  inadFileName: string | null;
  bazlFileName: string | null;

  // Semester selection
  availableSemesters: Semester[];
  selectedSemester: Semester | null;

  // Analysis results
  step1Results: Step1Result[] | null;
  step2Results: Step2Result[] | null;
  step3Results: Step3Result[] | null;
  threshold: number | null;

  // Configuration
  config: AnalysisConfig;

  // Status
  isAnalyzing: boolean;
  error: string | null;

  // Actions
  setINADData: (data: INADRecord[], fileName: string) => void;
  setBAZLData: (data: BAZLRecord[], fileName: string) => void;
  setSelectedSemester: (semester: Semester) => void;
  runAnalysis: () => void;
  reset: () => void;
  setError: (error: string | null) => void;
}

export const useAnalysisStore = create<AnalysisState>((set, get) => ({
  // Initial state
  inadData: null,
  bazlData: null,
  inadFileName: null,
  bazlFileName: null,
  availableSemesters: [],
  selectedSemester: null,
  step1Results: null,
  step2Results: null,
  step3Results: null,
  threshold: null,
  config: DEFAULT_CONFIG,
  isAnalyzing: false,
  error: null,

  // Actions
  setINADData: (data, fileName) => {
    const currentState = get();
    // Extract available semesters from BOTH INAD and BAZL data
    const semesters = extractAllSemesters(data, currentState.bazlData);
    const defaultSemester = semesters.length > 0 ? semesters[0] : null;

    set({
      inadData: data,
      inadFileName: fileName,
      availableSemesters: semesters,
      selectedSemester: defaultSemester,
      error: null,
      // Clear previous results when new data is loaded
      step1Results: null,
      step2Results: null,
      step3Results: null,
      threshold: null,
    });

    // Auto-run analysis if both files are loaded and semester selected
    const state = get();
    if (state.bazlData && state.selectedSemester) {
      get().runAnalysis();
    }
  },

  setBAZLData: (data, fileName) => {
    const currentState = get();
    // Extract available semesters from BOTH INAD and BAZL data
    const semesters = extractAllSemesters(currentState.inadData, data);
    // Keep current semester if still valid, otherwise use first available
    const currentSemesterStillValid = currentState.selectedSemester &&
      semesters.some(s => s.label === currentState.selectedSemester?.label);
    const selectedSemester = currentSemesterStillValid
      ? currentState.selectedSemester
      : (semesters.length > 0 ? semesters[0] : null);

    set({
      bazlData: data,
      bazlFileName: fileName,
      availableSemesters: semesters,
      selectedSemester: selectedSemester,
      error: null,
      // Clear previous results when new data is loaded
      step1Results: null,
      step2Results: null,
      step3Results: null,
      threshold: null,
    });

    // Auto-run analysis if both files are loaded and semester selected
    const state = get();
    if (state.inadData && state.selectedSemester) {
      get().runAnalysis();
    }
  },

  setSelectedSemester: (semester) => {
    set({
      selectedSemester: semester,
      // Clear previous results
      step1Results: null,
      step2Results: null,
      step3Results: null,
      threshold: null,
    });

    // Re-run analysis with new semester
    const state = get();
    if (state.inadData && state.bazlData) {
      get().runAnalysis();
    }
  },

  runAnalysis: () => {
    const state = get();

    if (!state.inadData || !state.bazlData) {
      set({ error: 'Both INAD and BAZL files must be loaded before running analysis' });
      return;
    }

    if (!state.selectedSemester) {
      set({ error: 'Please select a semester' });
      return;
    }

    set({ isAnalyzing: true, error: null });

    try {
      // Filter data by selected semester
      const filteredInadData = filterBySemester(state.inadData, state.selectedSemester);
      const filteredBazlData = filterBySemester(state.bazlData, state.selectedSemester);

      if (filteredInadData.length === 0) {
        set({
          error: `No INAD data found for ${state.selectedSemester.label}`,
          isAnalyzing: false,
        });
        return;
      }

      const results = runFullAnalysis(filteredInadData, filteredBazlData, state.config);

      set({
        step1Results: results.step1,
        step2Results: results.step2,
        step3Results: results.step3,
        threshold: results.threshold,
        isAnalyzing: false,
      });
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Analysis failed',
        isAnalyzing: false,
      });
    }
  },

  reset: () => {
    set({
      inadData: null,
      bazlData: null,
      inadFileName: null,
      bazlFileName: null,
      availableSemesters: [],
      selectedSemester: null,
      step1Results: null,
      step2Results: null,
      step3Results: null,
      threshold: null,
      isAnalyzing: false,
      error: null,
    });
  },

  setError: (error) => {
    set({ error });
  },
}));
