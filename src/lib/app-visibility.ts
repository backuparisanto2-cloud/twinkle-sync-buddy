/**
 * Shared signal for "splash is gone / page content is actually visible".
 * Used to gate anything (like the page tour) that shouldn't run while the
 * app is still hidden behind the splash screen.
 */

const STORAGE_KEY = "lavin-content-visible";
export const CONTENT_VISIBLE_EVENT = "lavin-content-visible";

export function isContentVisible(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.sessionStorage.getItem(STORAGE_KEY) === "1";
  } catch {
    return false;
  }
}

export function markContentVisible() {
  if (typeof window === "undefined") return;
  try {
    window.sessionStorage.setItem(STORAGE_KEY, "1");
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new CustomEvent(CONTENT_VISIBLE_EVENT));
}
