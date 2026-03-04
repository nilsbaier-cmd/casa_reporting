const CSV_FORMULA_PREFIX = /^[=+\-@]/;

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
