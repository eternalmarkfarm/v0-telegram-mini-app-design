"use client";

import { useEffect } from "react";

export default function TgPlatformClass() {
  useEffect(() => {
    const ua = navigator.userAgent || "";
    const platform = navigator.platform || "";
    const isTelegram = /Telegram/i.test(ua);
    const isLinux = /Linux|X11|Ubuntu|Debian/i.test(ua + " " + platform);
    const isAndroid = /Android/i.test(ua);
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    const tgPlatform = (window as any)?.Telegram?.WebApp?.platform;
    const isTDesktop = tgPlatform === "tdesktop";

    if (!isTelegram && !isTDesktop) return;

    if (isLinux) {
      document.documentElement.classList.add("tg-linux");
    }
    if (isAndroid) {
      document.documentElement.classList.add("tg-android");
    }
    if (isIOS) {
      document.documentElement.classList.add("tg-ios");
    }

    const root = document.querySelector(".prom-root");
    if (root) {
      if (isLinux) root.classList.add("tg-linux");
      if (isAndroid) root.classList.add("tg-android");
      if (isIOS) root.classList.add("tg-ios");
    }

    const applyAppHeight = () => {
      const height = window.innerHeight;
      document.documentElement.style.setProperty("--app-height", `${height}px`);
      if (root) {
        (root as HTMLElement).style.setProperty("--app-height", `${height}px`);
      }
      document.body.offsetHeight;
    };

    applyAppHeight();
    const handleResize = () => applyAppHeight();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        setTimeout(applyAppHeight, 60);
        setTimeout(applyAppHeight, 300);
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return null;
}
