"use client";

import { apiPost, getToken, setToken } from "@/lib/api";

export async function ensureAuth(): Promise<string> {
  const existing = getToken();
  if (existing) return existing;

  const initData = (window as any)?.Telegram?.WebApp?.initData;
  if (!initData) {
    throw new Error(
      "Нет токена и нет Telegram initData. Открой миниапп внутри Telegram или используй Dev login.",
    );
  }

  const res = await apiPost("/auth/telegram", { initData });
  if (!res?.token) throw new Error("auth/telegram не вернул token");
  setToken(res.token);
  return res.token;
}
