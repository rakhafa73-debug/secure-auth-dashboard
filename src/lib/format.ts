/** Date formatting helpers. All input is expected to be an ISO string. */

const DEFAULT_LOCALE = 'en-US';

export function formatDate(
  value: string | null | undefined,
  options: Intl.DateTimeFormatOptions = { dateStyle: 'medium' },
): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(DEFAULT_LOCALE, options).format(date);
}

export function formatDateTime(value: string | null | undefined): string {
  return formatDate(value, { dateStyle: 'medium', timeStyle: 'short' });
}

export function formatRelative(value: string | null | undefined): string {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';

  const diff = Date.now() - date.getTime();
  const abs = Math.abs(diff);
  const rtf = new Intl.RelativeTimeFormat(DEFAULT_LOCALE, { numeric: 'auto' });

  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['year', 1000 * 60 * 60 * 24 * 365],
    ['month', 1000 * 60 * 60 * 24 * 30],
    ['week', 1000 * 60 * 60 * 24 * 7],
    ['day', 1000 * 60 * 60 * 24],
    ['hour', 1000 * 60 * 60],
    ['minute', 1000 * 60],
    ['second', 1000],
  ];

  for (const [unit, ms] of units) {
    if (abs >= ms || unit === 'second') {
      const value = Math.round(diff / ms);
      return rtf.format(-value, unit);
    }
  }
  return '—';
}

export function formatNumber(value: number | null | undefined): string {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat(DEFAULT_LOCALE).format(value);
}
