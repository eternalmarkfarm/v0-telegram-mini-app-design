"use client";

import { useEffect, useState } from "react";
import { apiGet, apiPost, setToken, removeToken, getToken } from "@/lib/api";

import { GiveawayStatus } from "@/components/giveaway-status";
import { AccountLinking } from "@/components/account-linking";
import { Statistics } from "@/components/statistics";
import { LiveStreamers } from "@/components/live-streamers";
import { TrackedStreamers } from "@/components/tracked-streamers";
import { BottomActions } from "@/components/bottom-actions";
import { RecentPrizes } from "@/components/recent-prizes";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ChevronRight, Gift, Sparkles } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export default function Home() {
  const { t, language } = useI18n();
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
  const [viewerLoading, setViewerLoading] = useState(false);
  const [viewerErr, setViewerErr] = useState<string | null>(null);
  const [twitchDisconnectNote, setTwitchDisconnectNote] = useState(false);

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
    setViewerLoading(true);
    setViewerErr(null);
    try {
      const r = await apiGet("/viewer/me");
      setViewerData(r);
      setIsTwitchLinked(Boolean(r.twitch_user_id));
      setTwitchLogin(r.twitch_login);
      setIsSteamLinked(Boolean(r.steam_trade_url)); // Assuming this field exists or similar logic
    } catch (e: any) {
      console.error("Viewer data load error:", e);
      setViewerErr(String(e?.message ?? e));
    } finally {
      setViewerLoading(false);
    }
  };

  useEffect(() => {
    const tg = (window as any)?.Telegram?.WebApp;
    const initData = tg?.initData;

    if (!initData) return;

    (async () => {
      try {
        // 1. Optimistic Auth: Use existing token if available
        let currentToken = getToken();

        if (!currentToken) {
          // Only auth if no token
          const r = await apiPost("/auth/telegram", { initData });
          setToken(r.token);
        }

        // 2. Parallel Fetching: Load all data at once
        // This makes it 3x faster than sequential waiting
        // 2. Parallel Fetching: Load all data at once
        const fetchAll = async () => {
          // We initiate all requests efficiently, catching individual errors
          // so one failure (e.g. streamer 404) doesn't break everything else.
          const p1 = apiGet("/me").then(setMe).catch(e => console.error("Me load error:", e));
          const p2 = loadStreamer().catch(e => console.error("Streamer load error:", e));
          const p3 = loadViewerData().catch(e => console.error("Viewer load error:", e));

          await Promise.all([p1, p2, p3]);
        };

        await fetchAll();

      } catch (e: any) {
        // If token invalid, try to re-auth once
        console.error("Auth/Load error", e);
        if (e?.status === 401 || String(e).includes("401")) {
          try {
            removeToken();
            const r = await apiPost("/auth/telegram", { initData });
            setToken(r.token);
            await Promise.all([apiGet("/me").then(setMe), loadStreamer(), loadViewerData()]);
          } catch (retryErr: any) {
            setAuthError(String(retryErr?.message ?? retryErr));
          }
        } else {
          setAuthError(String(e?.message ?? e));
        }
      }
    })();

    // Refresh data when user returns to the tab (e.g. from external browser auth)
    const onFocus = () => {
      // Parallel refresh
      apiGet("/me").then(setMe).catch(console.error);
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

  const handleSteamLink = async (url: string) => {
    if (!url) return;
    try {
      await apiPost("/viewer/steam", { trade_url: url });
      setIsSteamLinked(true);
    } catch (e: any) {
      alert(`Ошибка сохранения Steam URL: ${e?.message ?? e}`);
    }
  };

  const handleTwitchUnlink = async () => {
    try {
      await apiPost("/viewer/twitch/unlink", {});
      setIsTwitchLinked(false);
      setTwitchLogin(null);
      setTwitchDisconnectNote(true);
    } catch (e: any) {
      alert(`Ошибка отвязки Twitch: ${e?.message ?? e}`);
    }
  };

  const handleSteamUnlink = async () => {
    try {
      await apiPost("/viewer/steam/unlink", {});
      setIsSteamLinked(false);
    } catch (e: any) {
      alert(`Ошибка отвязки Steam: ${e?.message ?? e}`);
    }
  };

  return (
    <main className="min-h-screen bg-background pb-8">
      <div className="mx-auto max-w-md px-4 py-4 space-y-3">
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
              <button className="border px-2 py-1 rounded bg-blue-100 dark:bg-blue-900" onClick={loadViewerData}>
                Force Refresh {viewerLoading && "..."}
              </button>
            </div>

            {viewerErr && <div className="text-xs text-red-600 mt-1">Viewer Load Error: {viewerErr}</div>}

            {viewerData && (
              <div className="mt-2 p-2 border border-blue-200 rounded text-[10px] bg-blue-50/50 overflow-auto">
                <strong>Debug Viewer Data:</strong>
                <div>TG ID: {viewerData.telegram_id}</div>
                <div>Twitch ID: {viewerData.twitch_user_id || "null"}</div>
                <div>Twitch Login: {viewerData.twitch_login || "null"}</div>
                <div>Linked At: {viewerData.twitch_linked_at || "null"}</div>
              </div>
            )}

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
        <Card className="border border-primary/30 bg-primary/10 backdrop-blur-sm px-3 py-2">
          <div className="flex items-center gap-2 mb-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/20">
              <Gift className="h-4 w-4 text-primary" />
            </span>
            <h3 className="text-sm font-semibold text-primary">
              {language === "ru" ? "Правила участия" : "Participation rules"}
            </h3>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {language === "ru" ? (
              <>
                Необходимо быть фоловером стримера на{" "}
                <span className="inline-flex items-center gap-1 text-[#9146ff]">
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
                  </svg>
                  Twitch
                </span>
                , отслеживать его в этом{" "}
                <span className="inline-flex items-center gap-1 text-primary">
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1.2 14.2-2.2-2.2 7-7 2.2 2.2-7 7z" />
                  </svg>
                  MINI APP
                </span>
                , привязать TWITCH ACC и URL Steam Trade. Профиль и инвентарь должны быть открыты в настройках приватности{" "}
                <span className="inline-flex items-center gap-1 text-[#66c0f4]">
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.606 0 11.979 0z" />
                  </svg>
                  Steam
                </span>
                . После начала отслеживания в MINI APP написать минимум одно сообщение в чате платформы стримера.
              </>
            ) : (
              <>
                You must follow the streamer on{" "}
                <span className="inline-flex items-center gap-1 text-[#9146ff]">
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
                  </svg>
                  Twitch
                </span>
                , track them in this{" "}
                <span className="inline-flex items-center gap-1 text-primary">
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1.2 14.2-2.2-2.2 7-7 2.2 2.2-7 7z" />
                  </svg>
                  MINI APP
                </span>
                , and link Twitch account + Steam Trade URL. Your profile and inventory must be public in{" "}
                <span className="inline-flex items-center gap-1 text-[#66c0f4]">
                  <svg className="h-3 w-3" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.606 0 11.979 0z" />
                  </svg>
                  Steam
                </span>
                settings. After tracking, send at least one chat message on the streamer's platform.
              </>
            )}
          </p>
        </Card>

        <AccountLinking
          twitchLinked={isTwitchLinked}
          steamLinked={isSteamLinked}
          twitchLogin={twitchLogin}
          isLoading={viewerLoading}
          onSteamLink={handleSteamLink}
          onTwitchUnlink={handleTwitchUnlink}
          onSteamUnlink={handleSteamUnlink}
          onRefreshStatus={loadViewerData}
        />
        {twitchDisconnectNote && (
          <div className="rounded-lg border border-amber-400/40 bg-amber-500/20 px-3 py-2 text-xs text-amber-100">
            Токен отозван. Чтобы убрать приложение из списка подключений Twitch, отключите его вручную в настройках Twitch.
          </div>
        )}

        <Statistics />
        <LiveStreamers />
        <TrackedStreamers />
        <RecentPrizes />
        <Link href="/prizes" className="block">
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm py-4 pl-0 pr-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="relative flex h-12 w-12 items-center justify-center rounded-full bg-green-500/15 shrink-0 -ml-3">
                <Gift className="h-6 w-6 text-green-500 animate-pulse" />
                <Sparkles className="absolute -top-1 -right-1 h-3.5 w-3.5 text-warning" />
              </span>
              <span className="text-lg font-semibold text-foreground">{t.myPrizes}</span>
            </div>
            <span className="inline-flex items-center gap-1 text-sm font-bold text-primary">
              {language === "ru" ? "Открыть" : "Open"}
              <ChevronRight className="h-5 w-5" />
            </span>
          </Card>
        </Link>
        <BottomActions />
      </div>
    </main>
  );
}
