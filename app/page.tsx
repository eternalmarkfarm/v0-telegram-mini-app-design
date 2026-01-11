"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost, setToken } from "@/lib/api";

import { GiveawayStatus } from "@/components/giveaway-status";
import { AccountLinking } from "@/components/account-linking";
import { Statistics } from "@/components/statistics";
import { LiveStreamers } from "@/components/live-streamers";
import { TrackedStreamers } from "@/components/tracked-streamers";
import { MyPrizes } from "@/components/my-prizes";
import { BottomActions } from "@/components/bottom-actions";

export default function Home() {
  const [isTwitchLinked, setIsTwitchLinked] = useState(false);
  const [isSteamLinked, setIsSteamLinked] = useState(false);

  // статус бекенда для теста связи фронт -> бекенд
  const [backendOk, setBackendOk] = useState<boolean | null>(null);
  const [me, setMe] = useState<any>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const devLogin = async () => {
    setAuthError(null);
    try {
      const r = await apiPost("/auth/dev");
      setToken(r.token);
    } catch (e: any) {
      setAuthError(String(e?.message ?? e));
    }
  };

  const loadMe = async () => {
    setAuthError(null);
    try {
      const r = await apiGet("/me");
      setMe(r);
    } catch (e: any) {
      setAuthError(String(e?.message ?? e));
    }
  };

  const telegramLogin = async () => {
    setAuthError(null);
    try {
      const tg = (window as any)?.Telegram?.WebApp;
      const initData = tg?.initData;
      if (!initData) {
        throw new Error("No Telegram.WebApp.initData (открой в Telegram Mini App)");
      }

      const r = await apiPost("/auth/telegram", { initData });
      setToken(r.token);
    } catch (e: any) {
      setAuthError(String(e?.message ?? e));
    }
  };

  useEffect(() => {
    const tg = (window as any)?.Telegram?.WebApp;
    const initData = tg?.initData;

    if (!initData) return; // не в Telegram → ничего не делаем

    (async () => {
      try {
        const r = await apiPost("/auth/telegram", { initData });
        setToken(r.token);
        const meData = await apiGet("/me");
        setMe(meData);
      } catch (e: any) {
        setAuthError(String(e?.message ?? e));
      }
    })();
  }, []);

  useEffect(() => {
    apiGet("/health")
      .then((r) => setBackendOk(Boolean(r?.ok)))
      .catch(() => setBackendOk(false));
  }, []);

  const handleTwitchLink = () => {
    setIsTwitchLinked(true);
  };

  const handleSteamLink = (url: string) => {
    if (url) {
      setIsSteamLinked(true);
    }
  };

  return (
    <main className="min-h-screen bg-background pb-8">
      <div className="mx-auto max-w-md px-4 py-4 space-y-4">
        <div className="text-xs opacity-70">
          Backend: {backendOk === null ? "checking..." : backendOk ? "OK" : "ERROR"}
          <div className="flex gap-2">
            <button className="border px-2 py-1 rounded" onClick={devLogin}>
              Dev login
            </button>
            <button className="border px-2 py-1 rounded" onClick={loadMe}>
              Load me
            </button>
            <button className="border px-2 py-1 rounded" onClick={telegramLogin}>
              Telegram login
            </button>
          </div>

          {authError && <div className="text-xs text-red-600">{authError}</div>}
          {me && <pre className="text-xs">{JSON.stringify(me, null, 2)}</pre>}
        </div>

        <GiveawayStatus isTwitchLinked={isTwitchLinked} isSteamLinked={isSteamLinked} />

        <AccountLinking
          twitchLinked={isTwitchLinked}
          steamLinked={isSteamLinked}
          onTwitchLink={handleTwitchLink}
          onSteamLink={handleSteamLink}
        />

        <Statistics />
        <LiveStreamers />
        <TrackedStreamers />
        <MyPrizes />
        <BottomActions />
      </div>
    </main>
  );
}
