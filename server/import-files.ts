import { existsSync, readdirSync } from 'node:fs';
import path from 'node:path';
import { detailsPath, readDetailLog } from './details-log';
import { readJson } from './files';
import { asRecord } from './json';
import { asDetailRows, mergeMatchDetails } from './merge';
import { isSourceName, summaryDocument, type LegacyWriter, type SourceName } from './player-store';

const FILE_NAME = /^player_(\d+)_(opendota|steam|stratz)(?:\.summary\.json|\.details\.jsonl|\.json)$/;

/** Copies player files into the database. Returns how many sources were written. */
export async function importLocalPlayers(root: string, writer: LegacyWriter): Promise<number> {
  const pairs = listPairs(root);
  let written = 0;
  for (const pair of pairs) {
    const legacy = asRecord(readJson(legacyPath(root, pair.accountId, pair.source)));
    const summaryFile = asRecord(readJson(summaryPath(root, pair.accountId, pair.source)));
    const base = summaryFile ?? legacy;
    const details = mergeMatchDetails(
      asDetailRows(legacy?.match_details),
      readDetailLog(detailsPath(root, pair.accountId, pair.source)),
    );
    if (!base && details.length === 0) continue;
    try {
      await writer.importSource({
        userId: null,
        accountId: pair.accountId,
        source: pair.source,
        summary: base ? summaryDocument(base) : null,
        details,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'импорт не удался';
      throw new Error(`Не удалось перенести ${pair.source} ${pair.accountId}: ${message}`);
    }
    written += 1;
  }
  return written;
}

function listPairs(root: string): { readonly accountId: number; readonly source: SourceName }[] {
  if (!existsSync(root)) return [];
  const found = new Map<string, { readonly accountId: number; readonly source: SourceName }>();
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const match = FILE_NAME.exec(entry.name);
    const accountText = match?.[1];
    const sourceText = match?.[2];
    if (!accountText || !sourceText || !isSourceName(sourceText)) continue;
    const accountId = Number(accountText);
    if (!Number.isSafeInteger(accountId) || accountId <= 0) continue;
    found.set(`${accountId}:${sourceText}`, { accountId, source: sourceText });
  }
  return [...found.values()];
}

function summaryPath(root: string, accountId: number, source: SourceName): string {
  return path.join(root, `player_${accountId}_${source}.summary.json`);
}

function legacyPath(root: string, accountId: number, source: SourceName): string {
  return path.join(root, `player_${accountId}_${source}.json`);
}
