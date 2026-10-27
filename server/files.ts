import { existsSync, mkdirSync, readFileSync, renameSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const cache = new Map<string, { readonly mtimeMs: number; readonly size: number; readonly data: unknown }>();

/** JSON from a file. Empty when the file is missing. */
export function readJson(file: string): unknown | null {
  if (!existsSync(file)) return null;
  const stat = statSync(file);
  const hit = cache.get(file);
  if (hit && hit.mtimeMs === stat.mtimeMs && hit.size === stat.size) return hit.data;
  const data: unknown = JSON.parse(readFileSync(file, 'utf8'));
  cache.set(file, { mtimeMs: stat.mtimeMs, size: stat.size, data });
  return data;
}

/** Writes JSON to a file. */
export function writeJson(file: string, data: unknown): void {
  const temporary = `${file}.${process.pid}.tmp`;
  writeFileSync(temporary, JSON.stringify(data, null, 2));
  renameSync(temporary, file);
  cache.delete(file);
}

/** Makes sure this directory exists. */
export function ensureDir(dir: string): void {
  mkdirSync(dir, { recursive: true });
}

/** Directory of saved player files. */
export function dataDir(root: string): string {
  return path.join(root, 'data');
}

/** Directory of cached reference data. */
export function cacheDir(root: string): string {
  return path.join(dataDir(root), 'cache');
}
