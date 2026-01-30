"use client";

import { useEffect } from "react";

export default function TgPlatformClass() {
  useEffect(() => {
    const ua = navigator.userAgent || "";
    const isTelegram = /Telegram/i.test(ua);
    const isLinux = /Linux/i.test(ua);
    const tgPlatform = (window as any)?.Telegram?.WebApp?.platform;
    const isTDesktop = tgPlatform === "tdesktop";

    if (!isTelegram && !isTDesktop) return;

    if (isLinux) {
      document.documentElement.classList.add("tg-linux");
    }
    if (isTDesktop) {
      document.documentElement.classList.add("tg-tdesktop");
    }

    const root = document.querySelector(".prom-root");
    if (root) {
      if (isLinux) root.classList.add("tg-linux");
      if (isTDesktop) root.classList.add("tg-tdesktop");
    }
  }, []);

  return null;
}
