export type CacheRecord<T> = {
  ts: number;
  data: T;
};

export function readCache<T>(key: string, maxAgeMs = 5 * 60 * 1000): T | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheRecord<T>;
    if (!parsed || typeof parsed.ts !== "number") return null;
    if (Date.now() - parsed.ts > maxAgeMs) return null;
    return parsed.data ?? null;
  } catch {
    return null;
  }
}

export function writeCache<T>(key: string, data: T) {
  if (typeof window === "undefined") return;
  try {
    const payload: CacheRecord<T> = { ts: Date.now(), data };
    localStorage.setItem(key, JSON.stringify(payload));
  } catch {
    // ignore write failures (quota, private mode)
  }
}
