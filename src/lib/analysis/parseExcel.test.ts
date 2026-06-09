import { describe, it, expect } from 'vitest';
import * as XLSX from 'xlsx';
import { parseINADFile, parseBAZLFile, validateINADData } from './parseExcel';

/** Build an in-memory .xlsx File from sheets given as arrays-of-arrays. */
function makeXlsxFile(sheets: Record<string, unknown[][]>): File {
  const workbook = XLSX.utils.book_new();
  for (const [name, rows] of Object.entries(sheets)) {
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(rows), name);
  }
  const buffer = XLSX.write(workbook, { type: 'array', bookType: 'xlsx' });
  return new File([buffer], 'test.xlsx');
}

/**
 * INAD header row: the parser reads named columns plus the refusal code from
 * the hardcoded column index 18 (column S), so the sheet needs 19+ columns.
 */
function inadHeader(): string[] {
  const header = Array.from({ length: 19 }, (_, i) => `col${i}`);
  header[0] = 'Fluggesellschaft';
  header[1] = 'Abflugort (last stop)';
  header[2] = 'Jahr';
  header[3] = 'Monat';
  header[18] = 'EVGrund';
  return header;
}

function inadRow(
  airline: string,
  lastStop: string,
  year: number,
  month: number,
  refusalCode: string
): unknown[] {
  const row: unknown[] = Array.from({ length: 19 }, () => null);
  row[0] = airline;
  row[1] = lastStop;
  row[2] = year;
  row[3] = month;
  row[18] = refusalCode;
  return row;
}

describe('parseINADFile', () => {
  it('parses rows and reads the refusal code from column S', async () => {
    const file = makeXlsxFile({
      'INAD-Tabelle': [inadHeader(), inadRow('LX', 'DUB', 2024, 8, 'A1')],
    });
    const records = await parseINADFile(file);
    expect(records).toEqual([
      { airline: 'LX', lastStop: 'DUB', year: 2024, month: 8, refusalCode: 'A1', included: true },
    ]);
  });

  it('marks excluded refusal codes and empty codes as not included', async () => {
    const file = makeXlsxFile({
      'INAD-Tabelle': [
        inadHeader(),
        inadRow('LX', 'DUB', 2024, 8, 'E'), // in EXCLUDE_CODES
        inadRow('LX', 'DUB', 2024, 8, ''), // empty code
        inadRow('LX', 'DUB', 2024, 8, 'A1'), // countable
      ],
    });
    const records = await parseINADFile(file);
    expect(records.map((r) => r.included)).toEqual([false, false, true]);
  });

  it('skips rows with missing essential fields', async () => {
    const file = makeXlsxFile({
      'INAD-Tabelle': [
        inadHeader(),
        inadRow('', 'DUB', 2024, 8, 'A1'), // no airline
        inadRow('LX', 'DUB', 2024, 0, 'A1'), // no month
        inadRow('LX', 'DUB', 2024, 8, 'A1'),
      ],
    });
    const records = await parseINADFile(file);
    expect(records).toHaveLength(1);
  });

  it('throws when the INAD-Tabelle sheet is missing', async () => {
    const file = makeXlsxFile({ Falsch: [['a'], [1]] });
    await expect(parseINADFile(file)).rejects.toThrow('INAD-Tabelle');
  });

  it('validateINADData rejects datasets where everything is excluded', () => {
    const records = [
      { airline: 'LX', lastStop: 'DUB', year: 2024, month: 8, refusalCode: 'E', included: false },
    ];
    expect(validateINADData(records).valid).toBe(false);
  });
});

const BAZL_HEADER = [
  'Airline Code (IATA)',
  'Airline Code (ICAO)',
  'Flughafen (IATA)',
  'Flughafen (ICAO)',
  'Passagiere / Passagers',
  'Jahr',
  'Monat',
];

describe('parseBAZLFile', () => {
  it('uses IATA codes directly when present', async () => {
    const file = makeXlsxFile({
      'BAZL-Daten': [BAZL_HEADER, ['LX', 'SWR', 'ZRH', 'LSZH', 50000, 2024, 8]],
    });
    const records = await parseBAZLFile(file);
    expect(records).toEqual([
      { airline: 'LX', airport: 'ZRH', pax: 50000, year: 2024, month: 8 },
    ]);
  });

  it('falls back to ICAO→IATA conversion via the reference sheets', async () => {
    const file = makeXlsxFile({
      'BAZL-Daten': [BAZL_HEADER, ['', 'DLH', '', 'EDDF', 30000, 2023, 3]],
      'Airlines IATA-Codes': [
        ['Nr', 'ICAO', 'IATA'],
        [1, 'DLH', 'LH'],
      ],
      'Airports IATA-Codes': [
        ['Nr', 'ICAO', 'IATA'],
        [1, 'EDDF', 'FRA'],
      ],
    });
    const records = await parseBAZLFile(file);
    expect(records).toEqual([
      { airline: 'LH', airport: 'FRA', pax: 30000, year: 2023, month: 3 },
    ]);
  });

  it('keeps the raw ICAO code when the lookup has no entry', async () => {
    const file = makeXlsxFile({
      'BAZL-Daten': [BAZL_HEADER, ['', 'XYZ', '', 'ABCD', 1000, 2023, 3]],
    });
    const records = await parseBAZLFile(file);
    expect(records[0].airline).toBe('XYZ');
    expect(records[0].airport).toBe('ABCD');
  });

  it('accepts month given as a numeric string', async () => {
    const file = makeXlsxFile({
      'BAZL-Daten': [BAZL_HEADER, ['LX', '', 'ZRH', '', 1000, 2023, '7']],
    });
    const records = await parseBAZLFile(file);
    expect(records[0].month).toBe(7);
  });

  it('skips rows without airline/airport/year/month', async () => {
    const file = makeXlsxFile({
      'BAZL-Daten': [
        BAZL_HEADER,
        ['', '', 'ZRH', '', 1000, 2023, 7], // no airline at all
        ['LX', '', 'ZRH', '', 1000, 0, 7], // no year
        ['LX', '', 'ZRH', '', 1000, 2023, 7],
      ],
    });
    const records = await parseBAZLFile(file);
    expect(records).toHaveLength(1);
  });
});
