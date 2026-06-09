import { describe, it, expect } from 'vitest';
import { calculateStep1, getStep1Summary } from './step1';
import { calculateStep2 } from './step2';
import { calculateStep3 } from './step3';
import { DEFAULT_CONFIG } from './constants';
import type { INADRecord, BAZLRecord } from './types';

function inad(
  airline: string,
  lastStop: string,
  included = true,
  overrides: Partial<INADRecord> = {}
): INADRecord {
  return {
    airline,
    lastStop,
    year: 2024,
    month: 8,
    refusalCode: included ? 'A1' : 'E',
    included,
    ...overrides,
  };
}

function inads(airline: string, lastStop: string, count: number, included = true): INADRecord[] {
  return Array.from({ length: count }, () => inad(airline, lastStop, included));
}

function bazl(airline: string, airport: string, pax: number): BAZLRecord {
  return { airline, airport, pax, year: 2024, month: 8 };
}

describe('Step 1 — airline screening', () => {
  it('counts only included records', () => {
    const data = [...inads('LX', 'DUB', 6), ...inads('LX', 'DUB', 4, false)];
    const results = calculateStep1(data);
    expect(results).toHaveLength(1);
    expect(results[0]).toEqual({ airline: 'LX', inadCount: 6, passesThreshold: true });
  });

  it('applies the minInad threshold inclusively (>= 6)', () => {
    const data = [...inads('LX', 'DUB', 6), ...inads('UA', 'EWR', 5)];
    const results = calculateStep1(data);
    expect(results.find((r) => r.airline === 'LX')?.passesThreshold).toBe(true);
    expect(results.find((r) => r.airline === 'UA')?.passesThreshold).toBe(false);
  });

  it('sorts by INAD count descending and summarizes correctly', () => {
    const data = [...inads('UA', 'EWR', 3), ...inads('LX', 'DUB', 9)];
    const results = calculateStep1(data);
    expect(results.map((r) => r.airline)).toEqual(['LX', 'UA']);

    const summary = getStep1Summary(results);
    expect(summary).toEqual({ totalAirlines: 2, passingAirlines: 1, totalInads: 12 });
  });
});

describe('Step 2 — route screening', () => {
  it('only considers routes of airlines that passed Step 1', () => {
    const data = [
      ...inads('LX', 'DUB', 6), // LX passes step 1
      ...inads('UA', 'EWR', 5), // UA does not
    ];
    const step1 = calculateStep1(data);
    const step2 = calculateStep2(data, step1);
    expect(step2.map((r) => r.airline)).toEqual(['LX']);
  });

  it('groups by (airline, lastStop) pairs', () => {
    const data = [
      ...inads('LX', 'DUB', 6),
      ...inads('LX', 'YUL', 3), // same airline, different route below threshold
    ];
    const step1 = calculateStep1(data);
    const step2 = calculateStep2(data, step1);

    const dub = step2.find((r) => r.lastStop === 'DUB');
    const yul = step2.find((r) => r.lastStop === 'YUL');
    expect(dub).toMatchObject({ inadCount: 6, passesThreshold: true });
    expect(yul).toMatchObject({ inadCount: 3, passesThreshold: false });
  });
});

describe('Step 3 — density analysis and classification', () => {
  function runStep3(routes: { airline: string; lastStop: string; count: number }[], bazlData: BAZLRecord[]) {
    const data = routes.flatMap((r) => inads(r.airline, r.lastStop, r.count));
    const step1 = calculateStep1(data);
    const step2 = calculateStep2(data, step1);
    return calculateStep3(step2, bazlData, DEFAULT_CONFIG);
  }

  it('calculates density as INADs per 1000 PAX', () => {
    const { results } = runStep3(
      [{ airline: 'LX', lastStop: 'DUB', count: 10 }],
      [bazl('LX', 'DUB', 50_000)]
    );
    expect(results[0].density).toBeCloseTo(0.2, 10);
  });

  it('uses the median of all densities as threshold (odd count)', () => {
    const { threshold } = runStep3(
      [
        { airline: 'AA', lastStop: 'JFK', count: 6 },
        { airline: 'BB', lastStop: 'CDG', count: 6 },
        { airline: 'CC', lastStop: 'IST', count: 6 },
      ],
      [bazl('AA', 'JFK', 60_000), bazl('BB', 'CDG', 30_000), bazl('CC', 'IST', 20_000)]
    );
    // densities: 0.1, 0.2, 0.3 -> median 0.2
    expect(threshold).toBeCloseTo(0.2, 10);
  });

  it('averages the two middle values as threshold (even count)', () => {
    const { threshold } = runStep3(
      [
        { airline: 'AA', lastStop: 'JFK', count: 6 },
        { airline: 'BB', lastStop: 'CDG', count: 6 },
        { airline: 'CC', lastStop: 'IST', count: 6 },
        { airline: 'DD', lastStop: 'DXB', count: 6 },
      ],
      [
        bazl('AA', 'JFK', 60_000), // 0.1
        bazl('BB', 'CDG', 30_000), // 0.2
        bazl('CC', 'IST', 15_000), // 0.4
        bazl('DD', 'DXB', 10_000), // 0.6
      ]
    );
    expect(threshold).toBeCloseTo(0.3, 10);
  });

  it('classifies HIGH_PRIORITY only when all three conditions hold', () => {
    // Route with high density and >= 10 INADs vs. a low-density anchor route
    const { results } = runStep3(
      [
        { airline: 'HI', lastStop: 'AAA', count: 12 },
        { airline: 'LO', lastStop: 'BBB', count: 6 },
      ],
      [bazl('HI', 'AAA', 20_000), bazl('LO', 'BBB', 120_000)]
    );
    // densities: HI 0.6, LO 0.05 -> threshold (median) 0.325
    // HI: 0.6 >= 0.4875 (1.5x), >= 0.10 minDensity, 12 >= 10 INADs -> HIGH_PRIORITY
    expect(results.find((r) => r.airline === 'HI')?.priority).toBe('HIGH_PRIORITY');
    expect(results.find((r) => r.airline === 'LO')?.priority).toBe('CLEAR');
  });

  it('denies HIGH_PRIORITY below the minimum INAD count, falling back to WATCH_LIST', () => {
    const { results } = runStep3(
      [
        { airline: 'HI', lastStop: 'AAA', count: 9 }, // only 9 INADs < 10
        { airline: 'LO', lastStop: 'BBB', count: 6 },
      ],
      [bazl('HI', 'AAA', 15_000), bazl('LO', 'BBB', 120_000)]
    );
    expect(results.find((r) => r.airline === 'HI')?.priority).toBe('WATCH_LIST');
  });

  it('classifies routes without PAX data as CLEAR with null density', () => {
    const { results } = runStep3(
      [{ airline: 'LX', lastStop: 'DUB', count: 10 }],
      [] // no BAZL data at all
    );
    expect(results[0].density).toBeNull();
    expect(results[0].priority).toBe('CLEAR');
  });

  it('returns threshold 0 when no route has a density', () => {
    const { threshold } = runStep3([{ airline: 'LX', lastStop: 'DUB', count: 10 }], []);
    expect(threshold).toBe(0);
  });

  it('sorts results by priority, then density descending', () => {
    const { results } = runStep3(
      [
        { airline: 'HI', lastStop: 'AAA', count: 12 },
        { airline: 'MID', lastStop: 'CCC', count: 7 },
        { airline: 'LO', lastStop: 'BBB', count: 6 },
      ],
      [bazl('HI', 'AAA', 20_000), bazl('MID', 'CCC', 20_000), bazl('LO', 'BBB', 120_000)]
    );
    expect(results.map((r) => r.airline)).toEqual(['HI', 'MID', 'LO']);
  });
});
