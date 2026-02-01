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
      const height = window.visualViewport?.height ?? window.innerHeight;
      document.documentElement.style.setProperty("--app-height", `${height}px`);
      if (root) {
        (root as HTMLElement).style.setProperty("--app-height", `${height}px`);
      }
      document.body.offsetHeight;
    };

    const forceRepaint = () => {
      if (!root) return;
      root.classList.add("ios-repaint");
      requestAnimationFrame(() => {
        root.classList.remove("ios-repaint");
      });
    };

    applyAppHeight();
    const handleResize = () => applyAppHeight();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        setTimeout(() => {
          applyAppHeight();
          forceRepaint();
        }, 60);
        setTimeout(() => {
          applyAppHeight();
          forceRepaint();
        }, 300);
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("orientationchange", handleResize);
    window.visualViewport?.addEventListener("resize", handleResize);
    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("pageshow", handleVisibility);

    const tg = (window as any)?.Telegram?.WebApp;
    if (tg?.onEvent) {
      tg.onEvent("viewport_changed", handleResize);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("orientationchange", handleResize);
      window.visualViewport?.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("pageshow", handleVisibility);
      if (tg?.offEvent) {
        tg.offEvent("viewport_changed", handleResize);
      }
    };
  }, []);

  return null;
}
