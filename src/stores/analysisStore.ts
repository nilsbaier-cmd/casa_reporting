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

export interface Semester {
  year: number;
  half: 1 | 2;
  label: string;
}

function getSemester(year: number, month: number): Semester {
  const half = month <= 6 ? 1 : 2;
  return {
    year,
    half,
    label: `${year} H${half}`,
  };
}

function filterBySemester<T extends { year: number; month: number }>(
  records: T[],
  semester: Semester
): T[] {
  const startMonth = semester.half === 1 ? 1 : 7;
  const endMonth = semester.half === 1 ? 6 : 12;

  return records.filter(
    (record) =>
      record.year === semester.year &&
      record.month >= startMonth &&
      record.month <= endMonth
  );
}

function extractAllSemesters(
  inadData: { year: number; month: number }[] | null,
  bazlData: { year: number; month: number }[] | null
): Semester[] {
  const semesterSet = new Set<string>();

  if (inadData) {
    for (const record of inadData) {
      semesterSet.add(getSemester(record.year, record.month).label);
    }
  }

  if (bazlData) {
    for (const record of bazlData) {
      semesterSet.add(getSemester(record.year, record.month).label);
    }
  }

  const semesters = Array.from(semesterSet).map((label) => {
    const [yearStr, halfStr] = label.split(' H');
    return {
      year: parseInt(yearStr, 10),
      half: parseInt(halfStr, 10) as 1 | 2,
      label,
    };
  });

  semesters.sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.half - a.half;
  });

  return semesters;
}

interface AnalysisState {
  inadData: INADRecord[] | null;
  bazlData: BAZLRecord[] | null;

  inadFileName: string | null;
  bazlFileName: string | null;

  availableSemesters: Semester[];
  selectedSemester: Semester | null;

  step1Results: Step1Result[] | null;
  step2Results: Step2Result[] | null;
  step3Results: Step3Result[] | null;
  threshold: number | null;

  config: AnalysisConfig;

  isAnalyzing: boolean;
  error: string | null;

  setINADData: (data: INADRecord[], fileName: string) => void;
  setBAZLData: (data: BAZLRecord[], fileName: string) => void;
  setSelectedSemester: (semester: Semester) => void;
  runAnalysis: () => void;
  reset: () => void;
  setError: (error: string | null) => void;
}

export const useAnalysisStore = create<AnalysisState>()((set, get) => ({
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

  setINADData: (data, fileName) => {
    const currentState = get();
    const semesters = extractAllSemesters(data, currentState.bazlData);
    const defaultSemester = semesters.length > 0 ? semesters[0] : null;

    set({
      inadData: data,
      inadFileName: fileName,
      availableSemesters: semesters,
      selectedSemester: defaultSemester,
      error: null,
      step1Results: null,
      step2Results: null,
      step3Results: null,
      threshold: null,
    });

    const updatedState = get();
    if (updatedState.bazlData && updatedState.selectedSemester) {
      updatedState.runAnalysis();
    }
  },

  setBAZLData: (data, fileName) => {
    const currentState = get();
    const semesters = extractAllSemesters(currentState.inadData, data);
    const hasCurrentSemester =
      currentState.selectedSemester &&
      semesters.some((semester) => semester.label === currentState.selectedSemester?.label);

    const selectedSemester = hasCurrentSemester
      ? currentState.selectedSemester
      : semesters.length > 0
      ? semesters[0]
      : null;

    set({
      bazlData: data,
      bazlFileName: fileName,
      availableSemesters: semesters,
      selectedSemester,
      error: null,
      step1Results: null,
      step2Results: null,
      step3Results: null,
      threshold: null,
    });

    const updatedState = get();
    if (updatedState.inadData && updatedState.selectedSemester) {
      updatedState.runAnalysis();
    }
  },

  setSelectedSemester: (semester) => {
    set({
      selectedSemester: semester,
      step1Results: null,
      step2Results: null,
      step3Results: null,
      threshold: null,
    });

    const currentState = get();
    if (currentState.inadData && currentState.bazlData) {
      currentState.runAnalysis();
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
