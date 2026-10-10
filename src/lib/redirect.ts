/**
 * Redirect-safety helpers.
 *
 * Open redirects are a common vulnerability. We only ever navigate to
 * same-origin, relative paths that we generated ourselves. Any absolute URL,
 * protocol-relative URL, or path outside the allow-list is rejected.
 */

const ALLOWED_PREFIXES = ['/dashboard', '/admin', '/profile', '/security', '/help'];

export function safeRedirectPath(
  raw: string | null | undefined,
  fallback: string | null = null,
): string | null {
  if (!raw) return fallback;

  // Must be an internal, absolute path (starts with a single slash).
  if (!raw.startsWith('/') || raw.startsWith('//')) return fallback;

  // Reject control characters and backslashes used in path-traversal tricks.
  const hasControlChar = Array.from(raw).some((ch) => ch.charCodeAt(0) < 0x20);
  if (hasControlChar || raw.includes('\\')) return fallback;

  // Normalise and verify the resulting path stays within the allow-list.
  try {
    const url = new URL(raw, 'https://secureauth.local');
    const path = url.pathname + url.search;
    const isAllowed = ALLOWED_PREFIXES.some(
      (prefix) => path === prefix || path.startsWith(`${prefix}/`) || path.startsWith(`${prefix}?`),
    );
    return isAllowed ? path : fallback;
  } catch {
    return fallback;
  }
}
