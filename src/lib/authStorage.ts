/**
 * Auth storage adapter supporting "Remember me".
 *
 * Supabase-js owns the token persistence entirely — we never touch tokens
 * directly. This adapter only decides *where* the SDK writes the session:
 *  - "Remember me" checked  -> localStorage  (survives browser restarts)
 *  - unchecked              -> sessionStorage (cleared when the tab closes)
 *
 * The preference itself is stored in sessionStorage so a fresh browser session
 * defaults to non-persistent until the user opts in.
 */

import type { SupportedStorage } from '@supabase/supabase-js';

const REMEMBER_KEY = 'secureauth.remember';

export function setRememberPreference(remember: boolean): void {
  try {
    if (remember) {
      sessionStorage.setItem(REMEMBER_KEY, '1');
    } else {
      sessionStorage.setItem(REMEMBER_KEY, '0');
    }
  } catch {
    /* Storage may be unavailable (private mode); degrade gracefully. */
  }
}

export function getRememberPreference(): boolean {
  try {
    return sessionStorage.getItem(REMEMBER_KEY) === '1';
  } catch {
    return false;
  }
}

function safeStorage(kind: 'local' | 'session'): Storage | null {
  try {
    return kind === 'local' ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

/**
 * The PKCE code verifier must survive a full browser restart: email
 * confirmation and password-recovery links are frequently opened in a new tab
 * or new browser session. It is therefore always kept in localStorage,
 * regardless of the "Remember me" choice (which only governs the session token).
 */
function isPkceVerifierKey(key: string): boolean {
  return key.endsWith('-code-verifier');
}

export const authStorage: SupportedStorage = {
  getItem(key: string): string | null {
    if (isPkceVerifierKey(key)) {
      return safeStorage('session')?.getItem(key) ?? safeStorage('local')?.getItem(key) ?? null;
    }
    const sessionValue = safeStorage('session')?.getItem(key);
    if (sessionValue !== null && sessionValue !== undefined) return sessionValue;
    return safeStorage('local')?.getItem(key) ?? null;
  },
  setItem(key: string, value: string): void {
    if (isPkceVerifierKey(key)) {
      safeStorage('local')?.setItem(key, value);
      safeStorage('session')?.removeItem(key);
      return;
    }
    const remember = getRememberPreference();
    const target = remember ? safeStorage('local') : safeStorage('session');
    target?.setItem(key, value);
    // Ensure token never lingers in the non-selected store.
    const other = remember ? safeStorage('session') : safeStorage('local');
    other?.removeItem(key);
  },
  removeItem(key: string): void {
    safeStorage('local')?.removeItem(key);
    safeStorage('session')?.removeItem(key);
  },
};
