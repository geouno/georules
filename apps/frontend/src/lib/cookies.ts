/**
 * Cookie utilities for auth state hints.
 * These are readable by JavaScript (not httpOnly) for UI purposes.
 */

const SESSION_HINT = "georules_session";
const KNOWN_USER = "georules_known_user";

/**
 * Set session hint cookie on login/signup.
 * Also marks user as "known" for returning user detection.
 */
export function setSessionCookies() {
  // Session hint: expires when browser closes (session cookie).
  document.cookie = `${SESSION_HINT}=1; path=/; SameSite=Lax`;
  // Known user: persists for 1 year.
  const oneYear = 365 * 24 * 60 * 60;
  document.cookie = `${KNOWN_USER}=1; path=/; max-age=${oneYear}; SameSite=Lax`;
  // Update DOM hint for current page.
  document.documentElement.dataset.auth = "true";
}

/**
 * Clear session hint cookie on logout.
 * Does NOT clear known_user (that's permanent).
 */
export function clearSessionCookie() {
  document.cookie = `${SESSION_HINT}=; path=/; max-age=0`;
  delete document.documentElement.dataset.auth;
}

/**
 * Check if user has an active session hint (synchronous cookie read).
 */
export function hasSessionHint(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some((c) =>
    c.startsWith("georules_session=")
  );
}

/**
 * Check if user is a returning user (has logged in before).
 */
export function isKnownUser(): boolean {
  if (typeof document === "undefined") return false;
  return document.cookie.split("; ").some((c) =>
    c.startsWith(`${KNOWN_USER}=`)
  );
}
