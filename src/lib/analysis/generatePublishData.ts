import type {
  INADRecord,
  BAZLRecord,
  Step1Result,
  Step2Result,
  Step3Result,
} from './types';
import type {
  PublishedData,
  PublishedRoute,
  PublishedAirline,
  PublishedTrendData,
} from './publishTypes';
import type { Semester } from '@/stores/analysisStore';

interface GeneratePublishDataParams {
  inadData: INADRecord[];
  bazlData: BAZLRecord[];
  selectedSemester: Semester;
  availableSemesters: Semester[];
  step1Results: Step1Result[];
  step2Results: Step2Result[];
  step3Results: Step3Result[];
  threshold: number;
}

export function generatePublishData(params: GeneratePublishDataParams): PublishedData {
  const {
    inadData,
    bazlData,
    selectedSemester,
    availableSemesters,
    step1Results,
    step2Results,
    step3Results,
    threshold,
  } = params;

  // Filter data for selected semester
  const startMonth = selectedSemester.half === 1 ? 1 : 7;
  const endMonth = selectedSemester.half === 1 ? 6 : 12;

  const semesterInadData = inadData.filter(
    (r) =>
      r.year === selectedSemester.year &&
      r.month >= startMonth &&
      r.month <= endMonth &&
      r.included
  );

  const semesterBazlData = bazlData.filter(
    (r) =>
      r.year === selectedSemester.year &&
      r.month >= startMonth &&
      r.month <= endMonth
  );

  // Calculate summary
  const totalInads = semesterInadData.length;
  const totalPax = semesterBazlData.reduce((sum, r) => sum + r.pax, 0);

  // Airlines
  const airlines: PublishedAirline[] = step1Results.map((r) => ({
    airline: r.airline,
    airlineName: r.airlineName,
    inadCount: r.inadCount,
    aboveThreshold: r.aboveThreshold,
  }));

  const airlinesAboveThreshold = airlines.filter((a) => a.aboveThreshold).length;

  // Routes from Step 3
  const routes: PublishedRoute[] = step3Results.map((r) => ({
    airline: r.airline,
    airlineName: r.airlineName,
    lastStop: r.lastStop,
    inadCount: r.inadCount,
    pax: r.pax,
    density: r.density,
    classification: r.classification,
  }));

  const routesAboveThreshold = step2Results.filter((r) => r.aboveThreshold).length;

  // Top 10 Last Stops
  const lastStopCounts = new Map<string, number>();
  for (const record of semesterInadData) {
    const count = lastStopCounts.get(record.lastStop) || 0;
    lastStopCounts.set(record.lastStop, count + 1);
  }
  const top10LastStops = Array.from(lastStopCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, count]) => ({ name, count }));

  // Top 10 Airlines
  const airlineCounts = new Map<string, { name: string; count: number }>();
  for (const record of semesterInadData) {
    const existing = airlineCounts.get(record.airline);
    if (existing) {
      existing.count++;
    } else {
      airlineCounts.set(record.airline, {
        name: record.airlineName,
        count: 1,
      });
    }
  }
  const top10Airlines = Array.from(airlineCounts.entries())
    .sort((a, b) => b[1].count - a[1].count)
    .slice(0, 10)
    .map(([code, data]) => ({ code, name: data.name, count: data.count }));

  // Trend data for all available semesters
  const trends: PublishedTrendData[] = availableSemesters
    .slice()
    .sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.half - b.half;
    })
    .map((semester) => {
      const semStart = semester.half === 1 ? 1 : 7;
      const semEnd = semester.half === 1 ? 6 : 12;

      const semInad = inadData.filter(
        (r) =>
          r.year === semester.year &&
          r.month >= semStart &&
          r.month <= semEnd &&
          r.included
      );

      const semBazl = bazlData.filter(
        (r) =>
          r.year === semester.year &&
          r.month >= semStart &&
          r.month <= semEnd
      );

      const inadCount = semInad.length;
      const paxCount = semBazl.reduce((sum, r) => sum + r.pax, 0);
      const density = paxCount > 0 ? (inadCount / paxCount) * 1000 : null;

      return {
        semester: semester.label,
        inadCount,
        paxCount,
        density: density !== null ? Number(density.toFixed(4)) : null,
      };
    });

  return {
    metadata: {
      publishedAt: new Date().toISOString(),
      semester: selectedSemester.label,
      semesterRange: {
        startMonth,
        endMonth,
        year: selectedSemester.year,
      },
      version: '1.0',
    },
    summary: {
      totalInads,
      totalPax,
      airlinesAnalyzed: airlines.length,
      airlinesAboveThreshold,
      routesAnalyzed: step2Results.length,
      routesAboveThreshold,
      medianDensity: threshold,
    },
    airlines,
    routes,
    trends,
    top10: {
      lastStops: top10LastStops,
      airlines: top10Airlines,
    },
  };
}
