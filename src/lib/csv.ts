const CSV_FORMULA_PREFIX = /^[=+\-@]/;

export const CSV_DELIMITER = ';';

/**
 * Build a semicolon-separated CSV (Swiss Excel format) and trigger a download.
 * Header and footer lines are passed through toSafeCsvField like every cell,
 * so all exports share the same injection-safe escaping.
 */
export function downloadCsv(
  filename: string,
  headers: string[],
  rows: (string | number | null | undefined)[][],
  footerRows: (string | number | null | undefined)[][] = []
): void {
  const toLine = (cells: (string | number | null | undefined)[]) =>
    cells.map((cell) => toSafeCsvField(cell)).join(CSV_DELIMITER);

  const lines = [toLine(headers), ...rows.map(toLine)];
  if (footerRows.length > 0) {
    lines.push('', ...footerRows.map(toLine));
  }

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function toSafeCsvField(value: unknown, delimiter = ';'): string {
  let field = value == null ? '' : String(value);

  field = field.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  if (CSV_FORMULA_PREFIX.test(field)) {
    field = `'${field}`;
  }

  if (field.includes(delimiter) || field.includes('"') || field.includes('\n')) {
    return `"${field.replace(/"/g, '""')}"`;
  }

  return field;
}
