/**
 * Validate a `?redirect=` value. Only same-origin absolute paths are allowed
 * ("/orders", not "//evil.com" or "https://…"); anything else falls back.
 */
export function getSafeRedirect(raw: string | null | undefined, fallback = '/'): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//') || raw.includes('\\')) {
    return fallback
  }
  return raw
}
