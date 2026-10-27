const MEDALS = ['', 'Рекрут', 'Страж', 'Рыцарь', 'Герой', 'Легенда', 'Властелин', 'Божество', 'Титан'];

/** Medal and star for a rank tier. Empty when the tier is unknown. */
export function formatRank(rankTier: number | null): string | null {
  if (rankTier == null || rankTier <= 0) return null;
  const medal = Math.floor(rankTier / 10);
  const star = rankTier % 10;
  const name = MEDALS[medal];
  if (!name) return null;
  if (medal >= 8) return name;
  if (star <= 0) return name;
  return `${name} ${star}`;
}

/** Win rate as a percent. A dash when the rate is unknown. */
export function formatWinRate(rate: number | null): string {
  if (rate == null) return '—';
  return `${(rate * 100).toFixed(1)}%`;
}

/** Match length as minutes and seconds. A dash when the length is unknown. */
export function formatLength(seconds: number | null): string {
  if (seconds == null || seconds < 0) return '—';
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${minutes}:${rest.toString().padStart(2, '0')}`;
}

/** Day and short month for a unix timestamp. */
export function formatDay(unixSeconds: number): string {
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short' }).format(new Date(unixSeconds * 1000));
}

/** Count with the Russian plural form that matches it. */
export function formatPlural(count: number, forms: readonly [string, string, string]): string {
  const mod10 = count % 10;
  const mod100 = count % 100;
  const word =
    mod10 === 1 && mod100 !== 11
      ? forms[0]
      : mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)
        ? forms[1]
        : forms[2];
  return `${count} ${word}`;
}

/** Day, month, and year for a unix timestamp. */
export function formatDate(unixSeconds: number): string {
  return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'short', year: 'numeric' }).format(
    new Date(unixSeconds * 1000),
  );
}

/** Wins and losses. A dash when either side is unknown. */
export function formatRecord(wins: number | null, losses: number | null): string {
  if (wins == null || losses == null) return '—';
  return `${wins}–${losses}`;
}
