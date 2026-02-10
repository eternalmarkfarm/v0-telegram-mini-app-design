"use client";

import { authTelegram, getToken } from "@/lib/api";

export async function ensureAuth(): Promise<string> {
  const existing = getToken();
  if (existing) return existing;

  const initData = (window as any)?.Telegram?.WebApp?.initData;
  if (!initData) {
    throw new Error(
      "Нет токена и нет Telegram initData. Пожалуйста, откройте приложение внутри Telegram.",
    );
  }

  return authTelegram(initData);
}
