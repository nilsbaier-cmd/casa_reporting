import { describe, it, expect } from 'vitest';
import { generatePublishData } from './generatePublishData';
import { calculateStep1 } from './step1';
import { calculateStep2 } from './step2';
import { calculateStep3 } from './step3';
import { DEFAULT_CONFIG } from './constants';
import type { INADRecord, BAZLRecord } from './types';
import type { Semester } from '@/stores/analysisStore';

function inads(
  airline: string,
  lastStop: string,
  count: number,
  { year = 2024, month = 8, included = true } = {}
): INADRecord[] {
  return Array.from({ length: count }, () => ({
    airline,
    lastStop,
    year,
    month,
    refusalCode: included ? 'A1' : 'E',
    included,
  }));
}

const SEM_2024_H2: Semester = { year: 2024, half: 2, label: '2024 H2' };
const SEM_2024_H1: Semester = { year: 2024, half: 1, label: '2024 H1' };

function build(inadData: INADRecord[], bazlData: BAZLRecord[]) {
  const semesterInad = inadData.filter(
    (r) => r.year === 2024 && r.month >= 7 && r.month <= 12
  );
  const step1 = calculateStep1(semesterInad);
  const step2 = calculateStep2(semesterInad, step1);
  const { results: step3, threshold } = calculateStep3(step2, bazlData, DEFAULT_CONFIG);

  return generatePublishData({
    inadData,
    bazlData,
    selectedSemester: SEM_2024_H2,
    availableSemesters: [SEM_2024_H1, SEM_2024_H2],
    step1Results: step1,
    step2Results: step2,
    step3Results: step3,
    threshold,
  });
}

describe('generatePublishData', () => {
  const inadData = [
    ...inads('LX', 'DUB', 10),
    ...inads('LX', 'DUB', 5, { included: false }),
    ...inads('UA', 'EWR', 3),
    ...inads('LX', 'YUL', 7, { month: 2 }), // other semester (2024 H1)
  ];
  const bazlData: BAZLRecord[] = [
    { airline: 'LX', airport: 'DUB', pax: 50000, year: 2024, month: 8 },
  ];

  it('separates included and excluded INADs in the summary', () => {
    const published = build(inadData, bazlData);
    expect(published.summary.includedInads).toBe(13); // 10 LX + 3 UA
    expect(published.summary.excludedInads).toBe(5);
    expect(published.summary.totalInads).toBe(18);
  });

  it('maps step 3 priorities to viewer classifications', () => {
    const published = build(inadData, bazlData);
    const route = published.routes.find((r) => r.airline === 'LX' && r.lastStop === 'DUB');
    expect(route).toBeDefined();
    expect(['sanction', 'watchList', 'clear']).toContain(route!.classification);
    expect(route!.density).toBeCloseTo(0.2, 10);
  });

  it('only counts the selected semester in top10 rankings', () => {
    const published = build(inadData, bazlData);
    // YUL had 7 INADs but in 2024 H1 — must not appear in the H2 top10
    expect(published.top10.lastStops.map((l) => l.name)).not.toContain('YUL');
    expect(published.top10.lastStops[0]).toEqual({ name: 'DUB', count: 10 });
  });

  it('builds chronological trends with null density for semesters without PAX', () => {
    const published = build(inadData, bazlData);
    expect(published.trends.map((t) => t.semester)).toEqual(['2024 H1', '2024 H2']);
    const h1 = published.trends[0];
    expect(h1.inadCount).toBe(7);
    expect(h1.paxCount).toBe(0);
    expect(h1.density).toBeNull();
  });

  it('contains no raw record fields — only aggregates leave the browser', () => {
    const published = build(inadData, bazlData);
    const json = JSON.stringify(published);
    expect(json).not.toContain('refusalCode');
    expect(json).not.toContain('"month"');
  });
});
