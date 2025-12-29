import * as XLSX from 'xlsx';
import type { INADRecord, BAZLRecord } from './types';
import { EXCLUDE_CODES, SHEET_NAMES, INAD_COLUMNS, BAZL_COLUMNS } from './constants';

/**
 * Parse INAD Excel file and return records
 */
export async function parseINADFile(file: File): Promise<INADRecord[]> {
  const data = await file.arrayBuffer();
  // Limit to 50000 rows to avoid memory issues with large .xlsm files
  // (actual data is typically < 20000 rows)
  const workbook = XLSX.read(data, { type: 'array', sheetRows: 50000 });

  // Get the INAD-Tabelle sheet
  const sheet = workbook.Sheets[SHEET_NAMES.inad];
  if (!sheet) {
    throw new Error(`Sheet "${SHEET_NAMES.inad}" not found in file`);
  }

  // Convert to JSON with header row (returns array of arrays)
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, defval: null });
  if (rows.length < 2) {
    throw new Error('No data found in INAD file');
  }

  // Build header index from first row
  const headerRow = rows[0] as (string | undefined)[];
  const headerIndex: Record<string, number> = {};
  headerRow.forEach((header, index) => {
    if (header) {
      headerIndex[header.toString().trim()] = index;
    }
  });

  // Get column indices
  const airlineIdx = headerIndex[INAD_COLUMNS.airline];
  const lastStopIdx = headerIndex[INAD_COLUMNS.lastStop];
  const yearIdx = headerIndex[INAD_COLUMNS.year];
  const monthIdx = headerIndex[INAD_COLUMNS.month];
  const refusalCodeIdx = INAD_COLUMNS.refusalCodeIndex; // Column S (hardcoded index 18)

  if (airlineIdx === undefined || lastStopIdx === undefined ||
      yearIdx === undefined || monthIdx === undefined) {
    throw new Error('Required columns not found in INAD file. Expected: Fluggesellschaft, Abflugort (last stop), Jahr, Monat');
  }

  // Parse data rows (skip header)
  const records: INADRecord[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i] as unknown[];
    if (!row || row.length === 0) continue;

    const airline = String(row[airlineIdx] || '').trim();
    const lastStop = String(row[lastStopIdx] || '').trim();
    const year = Number(row[yearIdx]) || 0;
    const month = Number(row[monthIdx]) || 0;
    const refusalCode = String(row[refusalCodeIdx] || '').trim();

    // Skip rows with missing essential data
    if (!airline || !lastStop || !year || !month) continue;

    // Determine if this record should be included (not in excluded codes)
    const included = refusalCode !== '' && !EXCLUDE_CODES.has(refusalCode);

    records.push({
      airline,
      lastStop,
      year,
      month,
      refusalCode,
      included,
    });
  }

  return records;
}

/**
 * Parse BAZL Excel file and return records
 */
export async function parseBAZLFile(file: File): Promise<BAZLRecord[]> {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });

  // Get the BAZL-Daten sheet
  const sheet = workbook.Sheets[SHEET_NAMES.bazl];
  if (!sheet) {
    throw new Error(`Sheet "${SHEET_NAMES.bazl}" not found in file`);
  }

  // Convert to JSON with header row (returns array of arrays)
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1 });
  if (rows.length < 2) {
    throw new Error('No data found in BAZL file');
  }

  // Build header index from first row
  const headerRow = rows[0] as (string | undefined)[];
  const headerIndex: Record<string, number> = {};
  headerRow.forEach((header, index) => {
    if (header) {
      headerIndex[header.toString().trim()] = index;
    }
  });

  // Get column indices - IATA preferred, ICAO as fallback
  const airlineIataIdx = headerIndex[BAZL_COLUMNS.airline];
  const airportIataIdx = headerIndex[BAZL_COLUMNS.airport];
  const airlineIcaoIdx = headerIndex['Airline Code (ICAO)'];
  const airportIcaoIdx = headerIndex['Flughafen (ICAO)'];
  const paxIdx = headerIndex[BAZL_COLUMNS.pax];
  const yearIdx = headerIndex[BAZL_COLUMNS.year];
  const monthIdx = headerIndex[BAZL_COLUMNS.month];

  // Need at least one airline column and one airport column
  const hasAirlineCol = airlineIataIdx !== undefined || airlineIcaoIdx !== undefined;
  const hasAirportCol = airportIataIdx !== undefined || airportIcaoIdx !== undefined;

  if (!hasAirlineCol || !hasAirportCol ||
      paxIdx === undefined || yearIdx === undefined || monthIdx === undefined) {
    throw new Error('Required columns not found in BAZL file. Expected: Airline Code (IATA/ICAO), Flughafen (IATA/ICAO), Passagiere / Passagers, Jahr, Monat');
  }

  // Parse data rows (skip header)
  const records: BAZLRecord[] = [];
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i] as unknown[];
    if (!row || row.length === 0) continue;

    // Try IATA first, fall back to ICAO if empty
    let airline = airlineIataIdx !== undefined ? String(row[airlineIataIdx] || '').trim() : '';
    if (!airline && airlineIcaoIdx !== undefined) {
      airline = String(row[airlineIcaoIdx] || '').trim();
    }

    let airport = airportIataIdx !== undefined ? String(row[airportIataIdx] || '').trim() : '';
    if (!airport && airportIcaoIdx !== undefined) {
      airport = String(row[airportIcaoIdx] || '').trim();
    }

    const pax = Number(row[paxIdx]) || 0;

    // Handle month - can be integer or Excel date serial
    let year = 0;
    let month = 0;

    const rawYear = row[yearIdx];
    const rawMonth = row[monthIdx];

    year = Number(rawYear) || 0;

    // Month can be: integer (1-12), Excel serial date, Date object, or string
    // Handle robustly as source data may have inconsistent formatting
    if (typeof rawMonth === 'number') {
      if (rawMonth > 12) {
        // Excel serial date - convert to date
        const excelDate = XLSX.SSF.parse_date_code(rawMonth);
        if (excelDate) {
          month = excelDate.m;
          // If year from serial differs, use it
          if (excelDate.y && excelDate.y !== year) {
            year = excelDate.y;
          }
        }
      } else {
        month = rawMonth;
      }
    } else if (rawMonth instanceof Date) {
      // JavaScript Date object
      month = rawMonth.getMonth() + 1;
    } else if (rawMonth && typeof rawMonth === 'object') {
      // Handle Date-like objects from XLSX library (may not pass instanceof check)
      // Check for getMonth method or date properties
      if (typeof (rawMonth as Date).getMonth === 'function') {
        month = (rawMonth as Date).getMonth() + 1;
      } else if ('m' in rawMonth && typeof (rawMonth as { m: number }).m === 'number') {
        // XLSX parsed date object with m property
        month = (rawMonth as { m: number }).m;
      }
    } else if (typeof rawMonth === 'string') {
      // Try to parse string date (e.g., "2020-01-01" or "1")
      const parsed = parseInt(rawMonth, 10);
      if (!isNaN(parsed) && parsed >= 1 && parsed <= 12) {
        month = parsed;
      } else {
        // Try parsing as ISO date string
        const dateMatch = rawMonth.match(/^\d{4}-(\d{2})-\d{2}/);
        if (dateMatch) {
          month = parseInt(dateMatch[1], 10);
        }
      }
    }

    // Skip rows with missing essential data
    if (!airline || !airport || !year || !month) continue;

    records.push({
      airline,
      airport,
      pax,
      year,
      month,
    });
  }

  return records;
}

/**
 * Validate that we have the expected data structure
 */
export function validateINADData(records: INADRecord[]): { valid: boolean; message: string } {
  if (records.length === 0) {
    return { valid: false, message: 'No INAD records found' };
  }

  const includedCount = records.filter(r => r.included).length;
  if (includedCount === 0) {
    return { valid: false, message: 'No included INAD records found (all filtered out)' };
  }

  return { valid: true, message: `Loaded ${records.length} records (${includedCount} included)` };
}

export function validateBAZLData(records: BAZLRecord[]): { valid: boolean; message: string } {
  if (records.length === 0) {
    return { valid: false, message: 'No BAZL records found' };
  }

  const totalPax = records.reduce((sum, r) => sum + r.pax, 0);
  if (totalPax === 0) {
    return { valid: false, message: 'No passenger data found' };
  }

  return { valid: true, message: `Loaded ${records.length} records (${totalPax.toLocaleString()} total passengers)` };
}
