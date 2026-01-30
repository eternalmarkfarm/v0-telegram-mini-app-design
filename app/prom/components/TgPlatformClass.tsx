"use client";

import { useEffect } from "react";

export default function TgPlatformClass() {
  useEffect(() => {
    const ua = navigator.userAgent || "";
    const platform = navigator.platform || "";
    const isTelegram = /Telegram/i.test(ua);
    const isLinux = /Linux|X11|Ubuntu|Debian/i.test(ua + " " + platform);
    const isAndroid = /Android/i.test(ua);
    const tgPlatform = (window as any)?.Telegram?.WebApp?.platform;
    const isTDesktop = tgPlatform === "tdesktop";

    if (!isTelegram && !isTDesktop) return;

    if (isLinux) {
      document.documentElement.classList.add("tg-linux");
    }
    if (isAndroid) {
      document.documentElement.classList.add("tg-android");
    }

    const root = document.querySelector(".prom-root");
    if (root) {
      if (isLinux) root.classList.add("tg-linux");
      if (isAndroid) root.classList.add("tg-android");
    }
  }, []);

  return null;
}
