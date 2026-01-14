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
  const [debug, setDebug] = useState(false);
  const [isTwitchLinked, setIsTwitchLinked] = useState(false);
  const [isSteamLinked, setIsSteamLinked] = useState(false);
  const [twitchLogin, setTwitchLogin] = useState<string | null>(null);

  // статус бекенда для теста связи фронт -> бэкенд
  const [backendOk, setBackendOk] = useState<boolean | null>(null);
  const [backendErr, setBackendErr] = useState<string | null>(null);
  const [me, setMe] = useState<any>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [streamer, setStreamer] = useState<any>(null);
  const [events, setEvents] = useState<Array<{ event_key: string; enabled: boolean }>>([]);
  const [streamerErr, setStreamerErr] = useState<string | null>(null);
  const [viewerData, setViewerData] = useState<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    setDebug(params.get("debug") === "1");
  }, []);

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
      await loadStreamer();
    } catch (e: any) {
      setAuthError(String(e?.message ?? e));
    }
  };

  const loadStreamer = async () => {
    setStreamerErr(null);
    try {
      const r = await apiGet("/streamer/me");
      setStreamer(r.streamer);
      setEvents(r.events ?? []);
    } catch (e: any) {
      setStreamerErr(String(e?.message ?? e));
    }
  };

  const becomeStreamer = async () => {
    setStreamerErr(null);
    try {
      const name = me?.first_name ?? me?.username ?? "Streamer";
      await apiPost("/streamer/me", { display_name: name });
      await loadStreamer();
    } catch (e: any) {
      setStreamerErr(String(e?.message ?? e));
    }
  };

  const toggleEvent = async (event_key: string, enabled: boolean) => {
    setStreamerErr(null);
    try {
      await apiPost("/streamer/events", { event_key, enabled });
      setEvents((prev) =>
        prev.map((x) => (x.event_key === event_key ? { ...x, enabled } : x))
      );
    } catch (e: any) {
      setStreamerErr(String(e?.message ?? e));
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

  const loadViewerData = async () => {
    try {
      const r = await apiGet("/viewer/me");
      setViewerData(r);
      setIsTwitchLinked(Boolean(r.twitch_user_id));
      setTwitchLogin(r.twitch_login);
    } catch (e: any) {
      // Ignore errors if user not authenticated yet
      console.log("Viewer data load error:", e);
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
        await loadStreamer();
        await loadViewerData();
      } catch (e: any) {
        setAuthError(String(e?.message ?? e));
      }
    })();

    // Refresh data when user returns to the tab (e.g. from external browser auth)
    const onFocus = () => {
      loadMe();
      loadStreamer();
      loadViewerData();
    };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") onFocus();
    });
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onFocus);
    };
  }, []);

  useEffect(() => {
    apiGet("/health")
      .then((r) => {
        setBackendOk(Boolean(r?.ok));
        setBackendErr(null);
      })
      .catch((e) => {
        setBackendOk(false);
        setBackendErr(String(e?.message ?? e));
      });
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
        {debug && (
          <div className="text-xs opacity-70">
            Backend: {backendOk === null ? "checking..." : backendOk ? "OK" : "ERROR"}
            {backendErr && <div className="text-xs text-red-600">{backendErr}</div>}
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

            <div className="mt-2 border rounded p-2">
              <div className="font-medium text-xs">Streamer settings</div>

              {!streamer ? (
                <button className="border px-2 py-1 rounded mt-2 text-xs" onClick={becomeStreamer}>
                  Become streamer
                </button>
              ) : (
                <div className="text-xs opacity-80 mt-1">
                  Streamer: {streamer.display_name} (id={streamer.id})
                </div>
              )}

              {streamerErr && <div className="text-xs text-red-600 mt-1">{streamerErr}</div>}

              {!!events.length && (
                <div className="mt-2 space-y-1">
                  {events.map((e) => (
                    <label key={e.event_key} className="flex items-center justify-between text-xs">
                      <span>{e.event_key}</span>
                      <input
                        type="checkbox"
                        checked={e.enabled}
                        onChange={(ev) => toggleEvent(e.event_key, ev.target.checked)}
                      />
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <GiveawayStatus isTwitchLinked={isTwitchLinked} isSteamLinked={isSteamLinked} />

        <AccountLinking
          twitchLinked={isTwitchLinked}
          steamLinked={isSteamLinked}
          twitchLogin={twitchLogin}
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
