"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import useSWR from "swr";
import { readCache, writeCache } from "@/lib/cache";
import { REFRESH_LIVE } from "@/app/prom/lib/refresh";
import { apiDelete, apiPost } from "@/lib/api";
import { ensureAuth } from "@/lib/ensureAuth";

const strPrizeIcon = "/prom/medal_new.svg";
const dollarIcon = "/prom/dollar-sign.svg";
const eyeIcon = "/prom/eye1.svg";
const liveStreamingIcon = "/prom/live_badge.svg";
const offlineIcon = "/prom/user.svg";

type StreamerItem = {
  id: number;
  nickname: string;
  twitchLogin?: string | null;
  avatar?: string | null;
  viewers?: number | null;
  streamStartMs: number;
  totalPrizes?: number | null;
  totalValue?: string | null;
  isOnline: boolean;
};

const addUserIcon = "/prom/add-user.svg";
const deleteUserIcon = "/prom/delete-user.svg";

function StreamersContent() {
  const searchParams = useSearchParams();
  const [nowMs, setNowMs] = useState(Date.now());
  const [trackingBusy, setTrackingBusy] = useState<number | null>(null);
  const [trackedSet, setTrackedSet] = useState<Set<number>>(new Set());
  const [streamers, setStreamers] = useState<StreamerItem[]>(
    () => readCache<StreamerItem[]>("prom:streamers:list") ?? []
  );
  const [loaded, setLoaded] = useState<boolean>(streamers.length > 0);
  const base = "";
  const onlineOnly = searchParams.get("online") === "1";
  const visibleStreamers = onlineOnly ? streamers.filter((streamer) => streamer.isOnline) : streamers;
  const onlineStreamers = visibleStreamers.filter((streamer) => streamer.isOnline);
  const offlineStreamers = visibleStreamers.filter((streamer) => !streamer.isOnline);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  const { data: liveRes } = useSWR("/streamers/live", undefined, { refreshInterval: REFRESH_LIVE });
  const { data: listRes } = useSWR("/streamers", undefined, { refreshInterval: REFRESH_LIVE });
  const { data: trackedRes } = useSWR("/viewer/tracked", undefined, { refreshInterval: 30000 });
  useEffect(() => {
    const next = new Set((trackedRes?.streamers ?? []).map((s: any) => s.id));
    setTrackedSet(next);
  }, [trackedRes]);

  const mergedStreamers = useMemo(() => {
    const live = liveRes?.streamers ?? [];
    const all = (listRes?.streamers ?? []).filter((s: any) => Boolean(s?.twitch_login));
    const liveMap = new Map<number, any>();
    live.forEach((s: any) => liveMap.set(s.id, s));
    return all
      .map((s: any) => {
        const liveRow = liveMap.get(s.id);
        const startedAt = liveRow?.started_at ? Date.parse(liveRow.started_at) : 0;
        const rawName = liveRow?.twitch_display_name || s.display_name || "";
        const nickname = rawName && rawName !== "Streamer" ? rawName : (s.twitch_login || "");
        const avatar = liveRow?.profile_image_url || s.profile_image_url || null;
        return {
          id: s.id,
          nickname,
          twitchLogin: s.twitch_login ?? liveRow?.twitch_login ?? null,
          avatar,
          viewers: liveRow?.viewer_count ?? 0,
          streamStartMs: startedAt || 0,
          totalPrizes: typeof s?.total_prizes === "number" ? s.total_prizes : null,
          totalValue: s?.total_amount ? `$${Number(s.total_amount).toFixed(2)}` : null,
          isOnline: Boolean(liveRow?.is_live),
        } as StreamerItem;
      })
      .filter((s: StreamerItem) => Boolean(s.nickname));
  }, [liveRes, listRes]);

  useEffect(() => {
    if (mergedStreamers.length >= 0) {
      setStreamers(mergedStreamers);
      writeCache("prom:streamers:list", mergedStreamers);
      setLoaded(true);
    }
  }, [mergedStreamers]);

  const formatDuration = (startMs: number, currentMs: number) => {
    if (!startMs) {
      return { hours: "00", minutes: "00" };
    }
    const totalSeconds = Math.max(0, Math.floor((currentMs - startMs) / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return {
      hours: String(hours).padStart(2, "0"),
      minutes: String(minutes).padStart(2, "0"),
    };
  };

  const toggleTrack = async (streamer: StreamerItem) => {
    if (!streamer?.id) return;
    const isTracked = trackedSet.has(streamer.id);
    try {
      setTrackingBusy(streamer.id);
      await ensureAuth();
      if (isTracked) {
        await apiDelete(`/viewer/tracked/${streamer.id}`);
        setTrackedSet((prev) => {
          const next = new Set(prev);
          next.delete(streamer.id);
          return next;
        });
      } else if (streamer.twitchLogin) {
        await apiPost("/viewer/tracked", { twitch_login: streamer.twitchLogin });
        setTrackedSet((prev) => new Set(prev).add(streamer.id));
      }
    } catch (e) {
      console.error("Failed to toggle tracked:", e);
    } finally {
      setTrackingBusy(null);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-white mb-6 drop-shadow-[0_0_12px_rgba(91,75,255,0.4)]">
        {onlineOnly ? "Стримеры онлайн" : "Стримеры"}
      </h1>

      <div className="space-y-3">
        {loaded && visibleStreamers.length === 0 ? (
          <div className="yuze-glass rounded-[24px] p-6 text-center text-[#b3b3ff]">
            Онлайн-стримеров пока нет.
          </div>
        ) : (
          <>
            {onlineStreamers.map((streamer) => (
              <Link
                key={streamer.id}
                href={`${base}/streamers/${streamer.id}`}
                className="prom-streamer-card block yuze-glass rounded-[12px] px-5 py-3 hover:bg-white/[0.14] transition-all duration-300"
              >
                <div className="prom-streamer-row flex items-center gap-3 -ml-2">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#9146FF] to-[#5B4BFF] rounded-full blur-sm opacity-50"></div>
                    <div className="relative w-14 h-14 rounded-[12px] border border-white/30 overflow-hidden bg-gradient-to-br from-[#101426] to-[#1a2140] flex items-center justify-center">
                      {streamer.avatar ? (
                        <img src={streamer.avatar} alt={streamer.nickname} className="w-full h-full object-cover" />
                      ) : null}
                    </div>
                  </div>

                  <div className="prom-streamer-main flex-1 min-w-0">
                    <h3 className="prom-streamer-name text-white font-bold text-lg truncate">{streamer.nickname}</h3>
                    {streamer.isOnline && (
                      <div className="prom-streamer-viewers flex items-center gap-1 mt-1">
                        <img src={eyeIcon} alt="" className="w-6 h-6" aria-hidden="true" />
                        <span className="text-sm font-semibold text-white">{streamer.viewers ?? 0}</span>
                      </div>
                    )}
                  </div>

                  <div className="prom-streamer-side">
                    {streamer.isOnline ? (
                      <div className="prom-streamer-status">
                        <img
                          src={liveStreamingIcon}
                          alt=""
                          className="w-12 h-12 drop-shadow-[0_0_10px_rgba(91,75,255,0.75)]"
                          aria-hidden="true"
                        />
                        <span className="-mt-2 text-base font-semibold text-white">
                          {formatDuration(streamer.streamStartMs, nowMs).hours}
                          <span className="mx-0.5 blink-strong">:</span>
                          {formatDuration(streamer.streamStartMs, nowMs).minutes}
                        </span>
                      </div>
                    ) : (
                      <div className="prom-streamer-status">
                        <img src={offlineIcon} alt="" className="w-12 h-12" aria-hidden="true" />
                      </div>
                    )}

                    {(streamer.totalPrizes !== null || streamer.totalValue) && (
                      <div className="prom-streamer-stats grid grid-cols-[1fr_1fr_auto] gap-x-4 gap-y-1 text-center items-center">
                        <div className={`flex flex-col items-center ${streamer.isOnline ? "" : "-ml-6"}`}>
                          <img src={strPrizeIcon} alt="" className="w-5 h-5" aria-hidden="true" />
                          <p className="text-base font-semibold text-white">{streamer.totalPrizes ?? "—"}</p>
                        </div>
                        <div className="flex flex-col items-center">
                          <img src={dollarIcon} alt="" className="w-5 h-5 -mt-0.5" aria-hidden="true" />
                          <p className="mt-1 text-base font-semibold text-[#00FF9D]">{streamer.totalValue ?? "—"}</p>
                        </div>
                        <button
                          type="button"
                          onPointerDown={(e) => e.preventDefault()}
                          onClick={(e) => {
                            e.preventDefault();
                            toggleTrack(streamer);
                          }}
                          className={`flex h-9 w-9 items-center justify-center rounded-[12px] border border-white/10 ${
                            trackedSet.has(streamer.id) ? "bg-[#5B4BFF]/35" : "bg-[#5B4BFF]/20"
                          }`}
                          aria-label={trackedSet.has(streamer.id) ? "Unfollow" : "Follow"}
                          disabled={trackingBusy === streamer.id}
                        >
                          <img
                            src={trackedSet.has(streamer.id) ? deleteUserIcon : addUserIcon}
                            alt=""
                            className="h-5 w-5"
                            aria-hidden="true"
                          />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
            {offlineStreamers.length > 0 && (
              <div className="pt-4">
                <p className="text-white/60 text-xs uppercase tracking-[0.2em]">Offline</p>
              </div>
            )}
            {offlineStreamers.map((streamer) => (
              <Link
                key={streamer.id}
                href={`${base}/streamers/${streamer.id}`}
                className="prom-streamer-card block yuze-glass rounded-[12px] px-5 py-3 hover:bg-white/[0.14] transition-all duration-300"
              >
                <div className="prom-streamer-row flex items-center gap-3 -ml-2">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#9146FF] to-[#5B4BFF] rounded-full blur-sm opacity-50"></div>
                    <div className="relative w-14 h-14 rounded-[12px] border border-white/30 overflow-hidden bg-gradient-to-br from-[#101426] to-[#1a2140] flex items-center justify-center">
                      {streamer.avatar ? (
                        <img src={streamer.avatar} alt={streamer.nickname} className="w-full h-full object-cover" />
                      ) : null}
                    </div>
                  </div>

                  <div className="prom-streamer-main flex-1 min-w-0">
                    <h3 className="prom-streamer-name text-white font-bold text-lg truncate">{streamer.nickname}</h3>
                  </div>

                  <div className="prom-streamer-side">
                    <div className="prom-streamer-status">
                      <img src={offlineIcon} alt="" className="w-12 h-12" aria-hidden="true" />
                    </div>

                    {(streamer.totalPrizes !== null || streamer.totalValue) && (
                      <div className="prom-streamer-stats grid grid-cols-[1fr_1fr_auto] gap-x-4 gap-y-1 text-center items-center">
                        <div className="flex flex-col items-center -ml-6">
                          <img src={strPrizeIcon} alt="" className="w-5 h-5" aria-hidden="true" />
                          <p className="text-base font-semibold text-white">{streamer.totalPrizes ?? "—"}</p>
                        </div>
                        <div className="flex flex-col items-center">
                          <img src={dollarIcon} alt="" className="w-5 h-5 -mt-0.5" aria-hidden="true" />
                          <p className="mt-1 text-base font-semibold text-[#00FF9D]">{streamer.totalValue ?? "—"}</p>
                        </div>
                        <button
                          type="button"
                          onPointerDown={(e) => e.preventDefault()}
                          onClick={(e) => {
                            e.preventDefault();
                            toggleTrack(streamer);
                          }}
                          className={`flex h-9 w-9 items-center justify-center rounded-[12px] border border-white/10 ${
                            trackedSet.has(streamer.id) ? "bg-[#5B4BFF]/35" : "bg-[#5B4BFF]/20"
                          }`}
                          aria-label={trackedSet.has(streamer.id) ? "Unfollow" : "Follow"}
                          disabled={trackingBusy === streamer.id}
                        >
                          <img
                            src={trackedSet.has(streamer.id) ? deleteUserIcon : addUserIcon}
                            alt=""
                            className="h-5 w-5"
                            aria-hidden="true"
                          />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

export default function Streamers() {
  return (
    <Suspense
      fallback={
        <div className="max-w-md mx-auto px-4 py-6">
          <div className="yuze-glass rounded-[24px] p-6 text-center text-[#b3b3ff]">
            Загрузка списка...
          </div>
        </div>
      }
    >
      <StreamersContent />
    </Suspense>
  );
}
