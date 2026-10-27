import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { asDetailRows, type DetailRow } from './merge';

type SourceName = 'opendota' | 'steam' | 'stratz';

const cache = new Map<string, { readonly mtimeMs: number; readonly size: number; readonly rows: DetailRow[] }>();

/** Path of the match-parse log for one source. */
export function detailsPath(root: string, accountId: number, source: SourceName): string {
  return path.join(root, `player_${accountId}_${source}.details.jsonl`);
}

/** Stored match parses for one source. */
export function readDetailLog(file: string): DetailRow[] {
  if (!existsSync(file)) return [];
  const stat = statSync(file);
  const hit = cache.get(file);
  if (hit && hit.mtimeMs === stat.mtimeMs && hit.size === stat.size) return hit.rows;
  const rows = readFileSync(file, 'utf8')
    .split('\n')
    .flatMap((line) => {
      const trimmed = line.trim();
      if (!trimmed) return [];
      try {
        return asDetailRows([JSON.parse(trimmed)]);
      } catch {
        return [];
      }
    });
  cache.set(file, { mtimeMs: stat.mtimeMs, size: stat.size, rows });
  return rows;
}
