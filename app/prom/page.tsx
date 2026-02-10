"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from "next/link";
import { ChevronDown, Headphones, Gift, Eye } from 'lucide-react';
import PrizeCard, { PrizeData } from "@/app/prom/components/PrizeCard";
import { apiDelete, apiGet, apiGetFresh, apiPost } from "@/lib/api";
import { readCache, writeCache } from "@/lib/cache";
import { ensureAuth } from "@/lib/ensureAuth";
import { useViewerStatus } from "@/app/prom/lib/useViewerStatus";
import { getEventLabel } from "@/lib/event-labels";
import { formatPrizeTime, mapPrizeStatus } from "@/app/prom/lib/prize-utils";
import { buildCacheKey, readCache as readPromCache, writeCache as writePromCache } from "@/app/prom/lib/cache";
import useSWR from "swr";
import {
  REFRESH_PRIZES,
  REFRESH_PROFILE,
  REFRESH_TRACKED,
  REFRESH_PRIZES_OFFLINE,
  REFRESH_TRACKED_OFFLINE,
} from "@/app/prom/lib/refresh";
const twitchAvatar = "/prom/twitch_avatar.webp";
const steamLogo = "/prom/social.png";
const avatarCircle = "/prom/circle.svg";
const followersIcon = "/prom/group.svg";
const rewardIcon = "/prom/medal_new.svg";
const strPrizeIcon = "/prom/medal_new.svg";
const dollarIcon = "/prom/dollar-sign.svg";
const eyeIcon = "/prom/eye1.svg";
const liveStreamingIcon = "/prom/live_badge.svg";
const offlineIcon = "/prom/user.svg";
const menuBarIcon = "/prom/menu-bar1.svg";
const blockIcon = "/prom/block.svg";
const addUserIcon = "/prom/add-user.svg";
const deleteUserIcon = "/prom/delete-user.svg";

type HomePrize = PrizeData;

type TrackedStreamer = {
  id: number;
  nickname: string;
  twitchLogin?: string | null;
  avatar?: string | null;
  isOnline: boolean;
  viewers?: number | null;
  streamStartMs: number;
  totalPrizes?: number;
  totalValue?: string;
};

export default function Home() {
  const { twitchLinked, steamLinked, twitchLogin, patch: patchViewer } = useViewerStatus();
  const viewerProfileKey = useMemo(() => buildCacheKey("prom:viewerProfile"), []);
  const cachedProfile = readPromCache<{ profile_image_url?: string | null; display_name?: string | null }>(viewerProfileKey);
  const [showSteamModal, setShowSteamModal] = useState(false);
  const [steamTradeUrl, setSteamTradeUrl] = useState('');
  const [nowMs, setNowMs] = useState(Date.now());
  const [isIntegrationsOpen, setIsIntegrationsOpen] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [androidAuthUrl, setAndroidAuthUrl] = useState<string | null>(null);
  const [androidAuthLoading, setAndroidAuthLoading] = useState(false);
  const [androidAuthError, setAndroidAuthError] = useState<string | null>(null);
  const [tracked, setTracked] = useState<TrackedStreamer[]>(
    () => readCache<TrackedStreamer[]>("prom:home:tracked") ?? []
  );
  const [trackingBusy, setTrackingBusy] = useState<number | null>(null);
  const cachedPrizes = useMemo(() => readCache<HomePrize[]>("prom:home:prizes") ?? [], []);
  const [viewerAvatar, setViewerAvatar] = useState<string | null>(cachedProfile?.profile_image_url ?? null);
  const [viewerDisplayName, setViewerDisplayName] = useState<string | null>(cachedProfile?.display_name ?? null);
  const needsConnections = !twitchLinked || !steamLinked;
  const base = "";

  const twitchNickname = viewerDisplayName || twitchLogin || 'Twitch User';
  const avatarSrc = viewerAvatar || twitchAvatar;

  const pickAndroidAuthUrl = (response: any) =>
    response?.short_url ||
    response?.shortUrl ||
    response?.short_link ||
    response?.shortLink ||
    response?.android_url ||
    response?.auth_url ||
    response?.authUrl ||
    response?.url;

  const openExternal = (url: string) => {
    const tg = (window as any)?.Telegram?.WebApp;
    if (tg?.openLink) {
      tg.openLink(url, { try_instant_view: false });
      return;
    }
    window.location.href = url;
  };

  const handleTwitchConnect = async () => {
    try {
      await ensureAuth();
      const response = await apiGet("/twitch/authorize-viewer-link");
      const url = pickAndroidAuthUrl(response);
      if (url) {
        openExternal(url);
      }
    } catch (e) {
      console.error("Twitch connect error:", e);
    }
  };

  const handleAndroidAuth = async () => {
    if (androidAuthLoading) return;
    setAndroidAuthLoading(true);
    setAndroidAuthError(null);
    try {
      await ensureAuth();
      const response = await apiGet("/twitch/authorize-viewer-link");
      const url = pickAndroidAuthUrl(response);
      if (url) {
        setAndroidAuthUrl(url);
      } else {
        setAndroidAuthError("Не удалось получить ссылку");
      }
    } catch (e) {
      console.error("Android Twitch link error:", e);
      setAndroidAuthError("Не удалось получить ссылку");
    } finally {
      setAndroidAuthLoading(false);
    }
  };

  const handleTwitchDisconnect = async () => {
    try {
      await apiPost("/viewer/twitch/unlink", {});
      patchViewer({ twitch_user_id: null, twitch_login: null, twitch_linked_at: null });
    } catch (e) {
      console.error("Twitch unlink error:", e);
    }
  };

  const handleSteamSave = async () => {
    if (!steamTradeUrl) return;
    try {
      await apiPost("/viewer/steam", { trade_url: steamTradeUrl });
      patchViewer({ steam_trade_url: steamTradeUrl });
      setShowSteamModal(false);
      setSteamTradeUrl('');
    } catch (e) {
      console.error("Steam save error:", e);
    }
  };

  const handleSteamDisconnect = async () => {
    try {
      await apiPost("/viewer/steam/unlink", {});
      patchViewer({ steam_trade_url: null });
    } catch (e) {
      console.error("Steam unlink error:", e);
    }
  };
 
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ua = navigator.userAgent || "";
    const platform = (window as any)?.Telegram?.WebApp?.platform;
    setIsAndroid(platform === "android" || /Android/i.test(ua));
  }, []);

  // no auto-prefetch on Android; user explicitly requests link

  useEffect(() => {
    if (!twitchLinked) {
      setViewerAvatar(null);
      setViewerDisplayName(null);
    }
  }, [twitchLinked]);

  const formatDuration = (startMs: number, currentMs: number) => {
    if (!startMs) {
      return { hours: '00', minutes: '00' };
    }
    const totalSeconds = Math.max(0, Math.floor((currentMs - startMs) / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return {
      hours: String(hours).padStart(2, '0'),
      minutes: String(minutes).padStart(2, '0'),
    };
  };

  const fetchTracked = async () => {
    await ensureAuth();
    return apiGetFresh("/viewer/tracked");
  };

  const { data: trackedRes } = useSWR("/viewer/tracked", fetchTracked, {
    refreshInterval: (res: any) => {
      const anyLive = Array.isArray(res?.streamers) && res.streamers.some((s: any) => Boolean(s?.is_live));
      return anyLive ? REFRESH_TRACKED : REFRESH_TRACKED_OFFLINE;
    },
  });

  const fetchViewerProfile = async () => {
    await ensureAuth();
    return apiGetFresh("/viewer/profile");
  };

  const { data: viewerProfile } = useSWR("/viewer/profile", fetchViewerProfile, {
    refreshInterval: REFRESH_PROFILE,
  });

  const fetchViewerPrizes = async () => {
    await ensureAuth();
    // Status refresh is expensive (hits Lis-Skins). Throttle it.
    const refreshedRecently = readCache<boolean>("prom:viewer:prizes:refresh", 60 * 1000);
    if (!refreshedRecently) {
      await apiPost("/viewer/prizes/refresh", {}).catch(() => {});
      writeCache("prom:viewer:prizes:refresh", true);
    }
    return apiGetFresh("/viewer/prizes?limit=3");
  };

  const anyTrackedLive = useMemo(() => {
    const items = trackedRes?.streamers ?? [];
    return Array.isArray(items) && items.some((s: any) => Boolean(s?.is_live));
  }, [trackedRes]);

  const { data: prizesRes } = useSWR("/viewer/prizes?limit=3", fetchViewerPrizes, {
    refreshInterval: anyTrackedLive ? REFRESH_PRIZES : REFRESH_PRIZES_OFFLINE,
  });

  useEffect(() => {
    if (!trackedRes?.streamers) return;
    const streamers = trackedRes.streamers ?? [];
    const baseMapped = streamers.map((s: any) => ({
      id: s.id,
      nickname: s.twitch_display_name || s.display_name || s.twitch_login || `#${s.id}`,
      twitchLogin: s.twitch_login ?? null,
      avatar: s.profile_image_url || null,
      isOnline: Boolean(s.is_live),
      viewers: s.viewer_count ?? null,
      streamStartMs: s.started_at ? Date.parse(s.started_at) : 0,
      totalPrizes: 0,
      totalValue: "$0.00",
    })) as TrackedStreamer[];
    setTracked(baseMapped);
    writeCache("prom:home:tracked", baseMapped);

    const hydrateStats = async () => {
      try {
        const top = streamers.slice(0, 3);
        const statsResponses = await Promise.all(
          top.map((s: any) => apiGetFresh(`/streamers/${s.id}`).catch(() => null))
        );
        const statsById = new Map<number, any>();
        statsResponses.forEach((res: any) => {
          if (res?.streamer?.id) statsById.set(res.streamer.id, res.stats);
        });
        setTracked((prev) => {
          const merged = prev.map((row) => {
            const statsRow = statsById.get(row.id);
            if (!statsRow) return row;
            return {
              ...row,
              totalPrizes: statsRow?.total_prizes ?? row.totalPrizes ?? 0,
              totalValue: statsRow?.total_amount
                ? `$${Number(statsRow.total_amount).toFixed(2)}`
                : row.totalValue ?? "$0.00",
            };
          });
          writeCache("prom:home:tracked", merged);
          return merged;
        });
      } catch (e) {
        console.error("Failed to load tracked stats:", e);
      }
    };
    hydrateStats();
  }, [trackedRes]);

  const toggleTrackHome = async (streamer: TrackedStreamer) => {
    if (!streamer?.id) return;
    const isTracked = tracked.some((s) => s.id === streamer.id);
    try {
      setTrackingBusy(streamer.id);
      await ensureAuth();
      if (isTracked) {
        await apiDelete(`/viewer/tracked/${streamer.id}`);
        setTracked((prev) => prev.filter((s) => s.id !== streamer.id));
      } else if (streamer.twitchLogin) {
        await apiPost("/viewer/tracked", { twitch_login: streamer.twitchLogin });
        setTracked((prev) => [...prev, streamer]);
      }
    } catch (e) {
      console.error("Failed to toggle tracked:", e);
    } finally {
      setTrackingBusy(null);
    }
  };

  useEffect(() => {
    const avatar = viewerProfile?.profile_image_url ?? null;
    if (avatar) setViewerAvatar(avatar);
    if (viewerProfile?.display_name) setViewerDisplayName(viewerProfile.display_name);
    if (avatar || viewerProfile?.display_name) {
      writePromCache(viewerProfileKey, { profile_image_url: avatar, display_name: viewerProfile?.display_name ?? null });
    }
  }, [viewerProfile, viewerProfileKey]);

  const prizes = useMemo(() => {
    if (!prizesRes) return cachedPrizes;
    const avatar = viewerProfile?.profile_image_url ?? null;
    const items = prizesRes.items ?? [];
    return items.map((item: any) => ({
      id: String(item.id),
      streamerName: item.streamer?.twitch_login || item.streamer?.display_name || "Streamer",
      winnerNick: twitchLogin || "you",
      winnerAvatar: avatar || undefined,
      time: formatPrizeTime(item.created_at),
      trigger: getEventLabel(item.event_key),
      deadline: formatPrizeTime(item.trade_offer_expiry_at),
      price: item.skin_price ? String(item.skin_price) : "0.00",
      status: mapPrizeStatus(item.delivery_status),
      game: "dota",
    })) as HomePrize[];
  }, [prizesRes, viewerProfile, twitchLogin, cachedPrizes]);

  useEffect(() => {
    if (prizesRes) {
      writeCache("prom:home:prizes", prizes);
    }
  }, [prizesRes, prizes]);

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      {/* Шапка с кнопкой Support */}
      <div className="flex items-center justify-between">
        <button
          className="flex items-center gap-2 text-[#4098F7] font-bold drop-shadow-[0_0_12px_rgba(64,152,247,0.6)]"
          onClick={() => {
            const url = "https://t.me/StreamersDrop_Support_Bot";
            window.open(url, "_blank", "noopener,noreferrer");
          }}
        >
          <Headphones className="w-5 h-5 text-[#4098F7] drop-shadow-[0_0_12px_rgba(64,152,247,0.9)]" />
          <span>Support</span>
        </button>
      </div>

      {/* Аватар и ник Twitch */}
      <div className="flex flex-col items-center gap-3">
        {twitchLinked ? (
          <>
            <div className="relative overflow-visible">
              <img
                src={avatarCircle}
                alt=""
                className="pointer-events-none absolute left-1/2 top-1/2 object-contain z-30"
                style={{
                  width: 260,
                  height: 260,
                  transform: 'translate(-50%, -50%) scale(1.42)',
                }}
                aria-hidden="true"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-[#9146FF] to-[#5B4BFF] rounded-full blur-md opacity-70"></div>
              <div className="relative z-10 w-24 h-24 rounded-full border border-white/40 overflow-hidden bg-gradient-to-br from-[#101426] to-[#1a2140] flex items-center justify-center shadow-[0_0_24px_rgba(145,70,255,0.35)]">
                <img src={avatarSrc} alt="Twitch Avatar" className="w-full h-full object-cover" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-wide drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]">
              {twitchNickname}
            </h2>
          </>
        ) : (
          <div className="relative">
            <div className="w-24 h-24 rounded-full border border-white/20 bg-white/5 flex items-center justify-center text-[#b3b3ff]">
              <span className="text-sm">Twitch Ava</span>
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        {needsConnections && (
          <div className="yuze-glass-soft rounded-[14px] px-4 py-2 text-sm text-[#b3b3ff]">
            <span className="text-white/90 font-semibold">Не все сервисы подключены.</span>{' '}
            {twitchLinked ? 'Подключите Steam в блоке ниже.' : steamLinked ? 'Подключите Twitch в блоке ниже.' : 'Подключите Twitch и Steam в блоке ниже.'}
          </div>
        )}

        {/* Блок интеграций */}
        <div className="prom-integrations-card yuze-glass-soft rounded-[16px] px-4 py-2">
        <button
          type="button"
          onClick={() => setIsIntegrationsOpen((prev) => !prev)}
          className="w-full flex items-center gap-3 text-left"
          aria-expanded={isIntegrationsOpen}
        >
          <img src={blockIcon} alt="" className="w-8 h-8" aria-hidden="true" />
          <div className="flex-1">
            <p className="text-white font-semibold">Интеграция сервисов</p>
            <p className="text-xs text-[#b3b3ff]">Twitch и Steam</p>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-[#b3b3ff] transition-transform ${
              isIntegrationsOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        <div
          className={`transition-all duration-300 ${
            isIntegrationsOpen
              ? `mt-4 ${isAndroid ? 'max-h-[360px]' : 'max-h-40'} opacity-100`
              : 'mt-0 max-h-0 opacity-0'
          } overflow-hidden`}
        >
          {isAndroid && !twitchLinked && (
            <div className="mb-3 rounded-[12px] border border-[#5B4BFF]/40 bg-[#1a1f3a]/70 px-3 py-2 text-xs text-[#b3b3ff]">
              <p className="font-semibold text-white mb-1">Android: ссылка для авторизации</p>
              <p className="mb-2">
                Откройте ссылку ниже в браузере (это рабочий вариант для Android).
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleAndroidAuth}
                  className="flex-1 rounded-[10px] bg-[#3b6bff] py-2 text-white font-semibold shadow-[0_4px_18px_rgba(59,107,255,0.45)]"
                >
                  {androidAuthLoading ? "Получаем..." : "Получить ссылку"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (androidAuthUrl) navigator.clipboard?.writeText(androidAuthUrl);
                  }}
                  className="rounded-[10px] px-3 py-2 text-white/90 bg-white/10"
                >
                  Копировать
                </button>
              </div>
              <input
                className="mt-2 w-full rounded-[8px] bg-[#12162a] border border-white/10 px-2 py-1 text-[11px] text-white/80"
                value={androidAuthUrl ?? ""}
                readOnly
                placeholder={androidAuthLoading ? "Ссылка подгружается..." : (androidAuthError ?? "Нажмите “Получить ссылку”")}
                onFocus={(e) => e.currentTarget.select()}
              />
            </div>
          )}
          <div className="prom-integrations-row flex gap-5">
            <button
              onClick={twitchLinked ? handleTwitchDisconnect : handleTwitchConnect}
              className="prom-integrations-btn flex-1 rounded-[10px] py-2 px-4 transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: twitchLinked
                  ? '#5a2a3a'
                  : '#9146FF',
                border: 'none',
                boxShadow: 'none',
              }}
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-[8px] flex items-center justify-center ${twitchLinked ? 'bg-red-500/20' : 'bg-white/20'}`}>
                  <svg
                    className={twitchLinked ? 'text-red-100' : 'text-white'}
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
                  </svg>
                </div>
                <span className="prom-integrations-label text-white font-bold">
                  {twitchLinked ? 'Удалить' : 'Привязать'}
                </span>
              </div>
            </button>

            <button
              onClick={steamLinked ? handleSteamDisconnect : () => setShowSteamModal(true)}
              className="prom-integrations-btn flex-1 rounded-[10px] py-2 px-4 transition-all duration-300 hover:scale-[1.02]"
              style={{
                background: steamLinked
                  ? '#5a2a3a'
                  : 'linear-gradient(140deg, #2E4A62 0%, #27364A 55%, #3E6C90 100%)',
                border: '0.5px solid rgba(255,255,255,0.2)',
                boxShadow: 'none',
              }}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center">
                  <img
                    src={steamLogo}
                    alt="Steam"
                    className={steamLinked ? 'w-10 h-10 opacity-90' : 'w-10 h-10 text-[#66C0F4]'}
                    style={{ filter: steamLinked ? 'none' : 'brightness(0.85) saturate(1.1) drop-shadow(0 0 6px rgba(80,60,140,0.5))' }}
                  />
                </div>
                <span className="prom-integrations-label text-white font-bold">
                  {steamLinked ? 'Удалить' : 'Привязать'}
                </span>
              </div>
            </button>
          </div>
        </div>
        </div>
      </div>

      {/* Отслеживаемые стримеры */}
      <div className="space-y-2">
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-white font-bold text-lg flex items-center gap-2">
          <img src={followersIcon} alt="" className="w-6 h-6" aria-hidden="true" />
          <span>Отслеживаемые стримеры</span>
        </h3>
        <Link href="/following" className="inline-flex">
          <img src={menuBarIcon} alt="" className="w-4.5 h-4.5 mr-2 mt-1" aria-hidden="true" />
        </Link>
      </div>

        {tracked.length > 0 ? (
          <div className="space-y-3">
            {tracked
              .sort((a, b) => (b.isOnline ? 1 : 0) - (a.isOnline ? 1 : 0))
              .slice(0, 3)
              .map((streamer) => (
                <Link
                  key={streamer.id}
                  href={`${base}/streamer/${streamer.id}`}
                  className="prom-streamer-card block yuze-glass rounded-[12px] px-5 py-3 hover:bg-white/[0.14] transition-all duration-300"
                >
                  <div className="prom-streamer-row flex items-center gap-3 -ml-2">
                    <div className="relative">
                      <div className="absolute inset-0 bg-gradient-to-br from-[#9146FF] to-[#5B4BFF] rounded-full blur-sm opacity-50"></div>
                      <div className="relative w-14 h-14 rounded-[12px] border border-white/30 overflow-hidden bg-gradient-to-br from-[#101426] to-[#1a2140] flex items-center justify-center">
                        {streamer.avatar ? (
                          <img
                            src={streamer.avatar}
                            alt={streamer.nickname}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-xs text-[#b3b3ff]">Avatar</span>
                        )}
                      </div>
                    </div>

                  <div className="prom-streamer-main flex-1 min-w-0">
                    <div className="prom-streamer-info-grid">
                      <h3 className="prom-streamer-name text-white font-bold text-lg truncate">
                        {streamer.nickname}
                      </h3>
                      <div className="prom-streamer-meta-icon prom-streamer-col-2">
                        {streamer.isOnline ? (
                          <img
                            src={liveStreamingIcon}
                            alt=""
                            className="prom-streamer-live-icon w-12 h-12 drop-shadow-[0_0_10px_rgba(91,75,255,0.75)]"
                            aria-hidden="true"
                          />
                        ) : (
                          <img src={offlineIcon} alt="" className="prom-streamer-live-icon w-12 h-12" aria-hidden="true" />
                        )}
                      </div>
                      <div className="prom-streamer-meta-icon prom-streamer-col-3">
                        <img src={strPrizeIcon} alt="" className="prom-streamer-prize-icon w-5 h-5" aria-hidden="true" />
                      </div>
                      <div className="prom-streamer-meta-icon prom-streamer-col-4">
                        <img src={dollarIcon} alt="" className="prom-streamer-dollar-icon w-5 h-5" aria-hidden="true" />
                      </div>
                      {streamer.isOnline && (
                        <div className="prom-streamer-viewers flex items-center gap-1">
                          <img src={eyeIcon} alt="" className="w-6 h-6" aria-hidden="true" />
                          <span className="prom-streamer-meta-number text-base font-semibold text-white">
                            {streamer.viewers ?? 0}
                          </span>
                        </div>
                      )}
                      <div className="prom-streamer-meta-value prom-streamer-col-2 text-base font-semibold text-white prom-streamer-meta-number">
                        {streamer.isOnline
                          ? `${formatDuration(streamer.streamStartMs, nowMs).hours}:${formatDuration(streamer.streamStartMs, nowMs).minutes}`
                          : "—"}
                      </div>
                      <div className="prom-streamer-meta-value prom-streamer-col-3 text-base font-semibold text-white prom-streamer-meta-number">
                        {streamer.totalPrizes ?? 0}
                      </div>
                      <div className="prom-streamer-meta-value prom-streamer-col-4 text-base font-semibold text-[#00FF9D] prom-streamer-meta-number">
                        {streamer.totalValue ?? "$0.00"}
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onPointerDown={(e) => e.preventDefault()}
                    onClick={(e) => {
                      e.preventDefault();
                      toggleTrackHome(streamer);
                    }}
                    className="prom-streamer-track flex h-9 w-9 items-center justify-center rounded-[12px] border border-white/10 bg-[#5B4BFF]/35"
                    aria-label="Unfollow"
                    disabled={trackingBusy === streamer.id}
                  >
                    <img src={deleteUserIcon} alt="" className="h-5 w-5" aria-hidden="true" />
                  </button>
                  </div>
                </Link>
              ))}
          </div>
        ) : (
          <div className="yuze-glass rounded-[12px] p-8 text-center">
            <Eye className="w-16 h-16 mx-auto mb-4 text-[#5B4BFF] drop-shadow-[0_0_12px_rgba(91,75,255,0.5)]" />
            <p className="text-[#b3b3ff]">
              Здесь будут отображаться отслеживаемые вами стримеры. Перейдите в
              раздел On Air и нажмите иконку отслеживания у нужного стримера.
            </p>
          </div>
        )}
      </div>

      {/* Выданные призы */}
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-white font-bold text-lg flex items-center gap-2">
          <img src={rewardIcon} alt="" className="w-6 h-6" aria-hidden="true" />
          <span>Выданные призы</span>
        </h3>
        <Link href="/prizes" className="inline-flex">
          <img src={menuBarIcon} alt="" className="w-4.5 h-4.5 mr-2 mt-1" aria-hidden="true" />
        </Link>
      </div>
      <div className="space-y-3">
        {prizes.length === 0 ? (
          <div className="yuze-glass rounded-[12px] px-5 py-3 flex items-center gap-4">
            <div className="w-14 h-14 rounded-[10px] bg-[#5B4BFF]/20 flex items-center justify-center shadow-[0_0_18px_rgba(91,75,255,0.5)]">
              <Gift className="w-7 h-7 text-white drop-shadow-[0_0_12px_rgba(91,75,255,0.7)]" />
            </div>
            <p className="text-[#b3b3ff] text-sm leading-relaxed">
              Здесь будут отображаться выданные вам в будущем призы
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {prizes.map((prize) => (
              <PrizeCard key={prize.id} prize={prize} />
            ))}
          </div>
        )}
      </div>

      {/* Модальное окно Steam */}
      {showSteamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-[12px]"
            onClick={() => setShowSteamModal(false)}
          ></div>
          <div className="relative z-10 w-full max-w-md yuze-glass rounded-[12px] p-6">
            <h4 className="text-white font-bold text-lg mb-4">Steam Trade URL</h4>
            <input
              type="text"
              value={steamTradeUrl}
              onChange={(e) => setSteamTradeUrl(e.target.value)}
              placeholder="https://steamcommunity.com/tradeoffer/new/..."
              className="w-full bg-white/5 border border-white/10 rounded-[10px] px-4 py-3 text-white placeholder:text-[#b3b3ff]/70 focus:outline-none focus:border-[#5B4BFF] transition-colors"
            />
            <div className="flex gap-3 mt-5">
              <button
                onClick={handleSteamSave}
                className="flex-1 bg-[#5B4BFF] rounded-[10px] px-4 py-3 text-white font-bold shadow-[0_0_18px_rgba(91,75,255,0.5)]"
              >
                Сохранить
              </button>
              <button
                onClick={() => setShowSteamModal(false)}
                className="flex-1 bg-white/5 border border-white/10 rounded-[10px] px-4 py-3 text-[#b3b3ff] font-semibold"
              >
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
