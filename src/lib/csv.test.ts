import { describe, it, expect } from 'vitest';
import { toSafeCsvField } from './csv';

describe('toSafeCsvField — CSV injection and escaping', () => {
  it('neutralizes formula triggers with a leading apostrophe', () => {
    expect(toSafeCsvField('=SUM(A1:A2)')).toBe("'=SUM(A1:A2)");
    expect(toSafeCsvField('+41791234567')).toBe("'+41791234567");
    expect(toSafeCsvField('-foo')).toBe("'-foo");
    expect(toSafeCsvField('@cmd')).toBe("'@cmd");
  });

  it('leaves harmless values untouched', () => {
    expect(toSafeCsvField('LX')).toBe('LX');
    expect(toSafeCsvField(42)).toBe('42');
  });

  it('quotes fields containing the delimiter', () => {
    expect(toSafeCsvField('a;b')).toBe('"a;b"');
  });

  it('escapes embedded quotes by doubling them', () => {
    expect(toSafeCsvField('say "hi"')).toBe('"say ""hi"""');
  });

  it('normalizes CR/CRLF to LF and quotes multi-line fields', () => {
    expect(toSafeCsvField('line1\r\nline2')).toBe('"line1\nline2"');
    expect(toSafeCsvField('line1\rline2')).toBe('"line1\nline2"');
  });

  it('renders null and undefined as empty strings', () => {
    expect(toSafeCsvField(null)).toBe('');
    expect(toSafeCsvField(undefined)).toBe('');
  });
});
