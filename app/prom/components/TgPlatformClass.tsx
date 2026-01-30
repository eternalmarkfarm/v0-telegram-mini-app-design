"use client";

import { useEffect } from "react";

export default function TgPlatformClass() {
  useEffect(() => {
    const ua = navigator.userAgent || "";
    const isTelegram = /Telegram/i.test(ua);
    const isLinux = /Linux/i.test(ua);
    if (!isTelegram || !isLinux) return;

    document.documentElement.classList.add("tg-linux");
    const root = document.querySelector(".prom-root");
    if (root) root.classList.add("tg-linux");
  }, []);

  return null;
}
