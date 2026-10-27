import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

/** Keys and paths the local server needs. */
export type Env = {
  /** Steam Web API key. Empty when it is not set. */
  readonly steamKey: string | null;

  /** STRATZ API key. Empty when it is not set. */
  readonly stratzKey: string | null;

  /** Directory of saved player files and the reference cache. */
  readonly root: string;

  /** Shared password for the public site. Empty in local development. */
  readonly password: string | null;

  /** MongoDB connection string. The database name is the path of this URI. */
  readonly mongoUri: string;
};

function loadEnvFile(file: string): void {
  if (!existsSync(file)) return;
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const index = trimmed.indexOf('=');
    if (index < 0) continue;
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (key && process.env[key] === undefined) process.env[key] = value;
  }
}

/** Keys and paths from the environment. */
export function readEnv(root = process.cwd()): Env {
  loadEnvFile(path.join(root, '.env'));
  const steamKey = process.env.STEAM_API_KEY?.trim() || null;
  const stratzKey = process.env.STRATZ_API_KEY?.trim() || process.env.STRATZ_API_TOKEN?.trim() || null;
  const dataRoot = process.env.DATA_DIR?.trim() || root;
  const password = process.env.APP_PASSWORD?.trim() || null;
  const mongoUri = process.env.MONGODB_URI?.trim() || 'mongodb://127.0.0.1:27017/dota';
  return { steamKey, stratzKey, root: dataRoot, password, mongoUri };
}
