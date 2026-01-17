"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiPost } from "@/lib/api";
import { ensureAuth } from "@/lib/ensureAuth";
import { Card } from "@/components/ui/card";

function CallbackInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [message, setMessage] = useState("Processing Twitch OAuth...");
  const isSuccess = status === "success";
  const isProcessing = status === "processing";
  const botUsername = "sobaka_oko_bot";
  const telegramReturnUrl = `https://t.me/${botUsername}?startapp=1`;

  const handleCloseWindow = () => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.close) {
      tg.close();
      return;
    }
    try {
      window.open("", "_self");
      window.close();
    } catch (e) {
      window.location.href = "about:blank";
    }
  };

  const handleReturnToTelegram = () => {
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.close) {
      tg.close();
      return;
    }
    if (tg?.openTelegramLink) {
      tg.openTelegramLink(telegramReturnUrl);
      return;
    }
    window.location.href = telegramReturnUrl;
  };

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // We try ensureAuth, but if it fails (external browser), we proceed anyway
        // because the backend now trusts the 'state' parameter for identification.
        try {
          await ensureAuth();
        } catch (e) {
          console.log("Not in Telegram or no initData, proceeding with state-based auth...");
        }

        // Get parameters from URL
        const code = sp.get("code");
        const state = sp.get("state");
        const error = sp.get("error");

        if (error) {
          throw new Error(`Twitch OAuth error: ${error}`);
        }

        if (!code || !state) {
          throw new Error("Missing code or state parameter");
        }

        // Используем универсальный эндпоинт - type читается из state на бэкенде
        const result = await apiPost("/twitch/exchange-universal", { code, state });
        setStatus("success");
        const userType = result?.type === "streamer" ? "Streamer" : "Viewer";
        setMessage(`✅ Twitch ${userType} account linked successfully! You can close this window and return to Telegram.`);
      } catch (e: any) {
        setStatus("error");
        setMessage(`❌ Error: ${e?.message ?? e}`);
      }
    };

    handleCallback();
  }, [sp, router]);

  return (
    <main
      className={`relative min-h-screen flex items-center justify-center overflow-hidden p-4 ${
        isSuccess ? "bg-black" : "bg-background"
      }`}
    >
      {isSuccess && (
        <>
          <div
            className="pointer-events-none absolute inset-0 bg-center bg-cover"
            style={{ backgroundImage: "url('/twitch-success.png')" }}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/35 via-black/35 to-black/60" />
        </>
      )}
      <div className="relative z-10 w-full max-w-xl pointer-events-auto">
        <Card
          className={`w-full border border-white/15 bg-black/45 text-center backdrop-blur ${isSuccess ? "p-8" : "p-6"}`}
        >
          <div className="mb-4">
            {isProcessing && (
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            )}
            {isSuccess && (
              <div className="flex items-center justify-center gap-3 text-white text-xl font-semibold">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#9146ff]/20 text-[#b794ff]">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                    <path
                      fill="currentColor"
                      d="M6 3h16v11l-4 4h-5l-3 3v-3H6V3zm3 6h2v4H9V9zm4 0h2v4h-2V9z"
                    />
                  </svg>
                </span>
                <span>Twitch удачно привязан</span>
                <span className="text-2xl">✅</span>
              </div>
            )}
            {status === "error" && <div className="text-6xl">❌</div>}
          </div>
          {isSuccess ? (
            <>
              <p className="text-lg text-white/95">
                Теперь вы можете продолжить пользоваться приложением в Telegram.
                <br />
                Это окно можно закрыть.
              </p>
              <div className="mt-6 space-y-3">
                <button
                  onClick={handleCloseWindow}
                  type="button"
                  className="w-full rounded-lg py-3 text-sm font-semibold text-white shadow-lg shadow-[#9146ff]/30 bg-gradient-to-r from-[#6f3ad6] via-[#8b5cf6] to-[#6f3ad6]"
                >
                  Закрыть окно
                </button>
                <button
                  onClick={handleReturnToTelegram}
                  type="button"
                  className="w-full rounded-lg py-3 text-sm font-semibold text-white/90 bg-white/10 border border-white/10 hover:bg-white/15"
                >
                  Вернуться в Telegram
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-lg text-foreground">{message}</p>
              {status === "error" && (
                <button
                  onClick={() => router.push("/")}
                  className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
                >
                  Return to Home
                </button>
              )}
            </>
          )}
        </Card>
      </div>
    </main>
  );
}

export default function TwitchCallbackPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </main>
    }>
      <CallbackInner />
    </Suspense>
  );
}
