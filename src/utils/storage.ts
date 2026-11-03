/**
 * Safe localStorage helpers. Reads fall back when the key is missing, the JSON
 * is corrupt or fails the guard; writes never throw (private mode, quota).
 */
export function loadJSON<T>(key: string, fallback: T, isValid: (value: unknown) => value is T): T {
  try {
    const raw = window.localStorage.getItem(key)
    if (raw === null) return fallback
    const parsed: unknown = JSON.parse(raw)
    return isValid(parsed) ? parsed : fallback
  } catch {
    return fallback
  }
}

export function saveJSON(key: string, value: unknown): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Persistence is best-effort.
  }
}

export function removeItem(key: string): void {
  try {
    window.localStorage.removeItem(key)
  } catch {
    // Persistence is best-effort.
  }
}
