/** An object value. Empty when the value is not an object. */
export function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

/** A list value, or an empty list. */
export function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

/** A finite number. Empty otherwise. */
export function asNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value))) return Number(value);
  return null;
}

/** A string. Empty otherwise. */
export function asString(value: unknown): string | null {
  return typeof value === 'string' && value.length > 0 ? value : null;
}

/** A boolean. Empty otherwise. */
export function asBoolean(value: unknown): boolean | null {
  if (typeof value === 'boolean') return value;
  if (value === 1 || value === '1') return true;
  if (value === 0 || value === '0') return false;
  return null;
}

/** Current time. */
export function stamp(): string {
  return new Date().toISOString().replace(/\.\d{3}Z$/, 'Z');
}

/** Unix seconds for a millisecond timestamp. */
export function unixSeconds(value: number): number {
  return value > 10_000_000_000 ? Math.floor(value / 1000) : value;
}
