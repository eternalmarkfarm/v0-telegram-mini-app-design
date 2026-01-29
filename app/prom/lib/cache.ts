"use client";

export type CacheEntry<T> = {
  data: T;
  ts: number;
};

const safeParse = <T,>(value: string | null): CacheEntry<T> | null => {
  if (!value) return null;
  try {
    return JSON.parse(value) as CacheEntry<T>;
  } catch {
    return null;
  }
};

export const getTelegramUserId = () => {
  if (typeof window === "undefined") return null;
  const tg = (window as any)?.Telegram?.WebApp;
  const id = tg?.initDataUnsafe?.user?.id;
  return typeof id === "number" || typeof id === "string" ? String(id) : null;
};

export const buildCacheKey = (baseKey: string) => {
  const userId = getTelegramUserId();
  return userId ? `${baseKey}:${userId}` : `${baseKey}:anon`;
};

export const readCache = <T,>(key: string): T | null => {
  if (typeof window === "undefined") return null;
  const entry = safeParse<T>(localStorage.getItem(key));
  return entry?.data ?? null;
};

export const writeCache = <T,>(key: string, data: T) => {
  if (typeof window === "undefined") return;
  const entry: CacheEntry<T> = { data, ts: Date.now() };
  localStorage.setItem(key, JSON.stringify(entry));
};
