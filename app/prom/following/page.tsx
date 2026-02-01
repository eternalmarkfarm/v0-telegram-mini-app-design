"use client";

import { useEffect, useMemo, useState } from 'react';
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiGetFresh } from "@/lib/api";
import { ensureAuth } from "@/lib/ensureAuth";
import useSWR from "swr";
import { REFRESH_TRACKED } from "@/app/prom/lib/refresh";
const followersIcon = "/prom/group.svg";
const strPrizeIcon = "/prom/str_prize.svg";
const dollarIcon = "/prom/dollar.svg";
const eyeIcon = "/prom/eye1.svg";
const liveStreamingIcon = "/prom/live_badge.svg";
const offlineIcon = "/prom/user.svg";
const leftArrowIcon = "/prom/left-arrow.svg";


type TrackedStreamer = {
  id: number;
  nickname: string;
  avatar?: string | null;
  isOnline: boolean;
  viewers?: number | null;
  streamStartMs: number;
  totalPrizes?: number;
  totalValue?: string;
};

export default function Following() {
  const router = useRouter();
  const [nowMs, setNowMs] = useState(Date.now());
  const base = "";
  const [tracked, setTracked] = useState<TrackedStreamer[]>([]);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  const fetchTracked = async () => {
    await ensureAuth();
    return apiGetFresh("/viewer/tracked");
  };

  const { data } = useSWR("/viewer/tracked", fetchTracked, { refreshInterval: REFRESH_TRACKED });

  useEffect(() => {
    const streamers = data?.streamers ?? [];
    if (streamers.length === 0) {
      setTracked([]);
      return;
    }
    const baseMapped = streamers.map((s: any) => ({
      id: s.id,
      nickname: s.twitch_display_name || s.display_name || s.twitch_login || `#${s.id}`,
      avatar: s.profile_image_url || null,
      isOnline: Boolean(s.is_live),
      viewers: s.viewer_count ?? null,
      streamStartMs: s.started_at ? Date.parse(s.started_at) : 0,
      totalPrizes: 0,
      totalValue: "$0.00",
    })) as TrackedStreamer[];
    setTracked(baseMapped);

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
        setTracked((prev) =>
          prev.map((row) => {
            const statsRow = statsById.get(row.id);
            if (!statsRow) return row;
            return {
              ...row,
              totalPrizes: statsRow?.total_prizes ?? row.totalPrizes ?? 0,
              totalValue: statsRow?.total_amount
                ? `$${Number(statsRow.total_amount).toFixed(2)}`
                : row.totalValue ?? "$0.00",
            };
          })
        );
      } catch (e) {
        console.error("Failed to load tracked stats:", e);
      }
    };
    hydrateStats();
  }, [data]);

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

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="w-8 h-8 rounded-[8px] bg-white/5 border border-white/10 flex items-center justify-center"
          aria-label="Назад"
        >
          <img src={leftArrowIcon} alt="" className="w-5 h-5" aria-hidden="true" />
        </button>
        <img src={followersIcon} alt="" className="w-6 h-6" aria-hidden="true" />
        <h1 className="text-white font-bold text-lg">Отслеживаемые стримеры</h1>
      </div>

      <div className="space-y-3">
        {tracked
          .sort((a, b) => (b.isOnline ? 1 : 0) - (a.isOnline ? 1 : 0))
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
                  <h3 className="prom-streamer-name text-white font-bold text-lg truncate">{streamer.nickname}</h3>
                  {streamer.isOnline && (
                    <div className="prom-streamer-viewers flex items-center gap-1 mt-1">
                      <img src={eyeIcon} alt="" className="w-6 h-6" aria-hidden="true" />
                      <span className="text-sm font-semibold text-white">{streamer.viewers ?? 0}</span>
                    </div>
                  )}
                </div>

                <div className="prom-streamer-side flex items-end gap-4 -mt-2">
                  {streamer.isOnline ? (
                    <div className="flex flex-col items-center gap-0 -mt-1 w-20">
                      <img
                        src={liveStreamingIcon}
                        alt=""
                        className="w-12 h-12 animate-pulse drop-shadow-[0_0_10px_rgba(91,75,255,0.75)]"
                        aria-hidden="true"
                      />
                      <span className="-mt-2 text-base font-semibold text-white">
                        {formatDuration(streamer.streamStartMs, nowMs).hours}
                        <span className="mx-0.5 blink-strong">:</span>
                        {formatDuration(streamer.streamStartMs, nowMs).minutes}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-start w-20 -ml-0.5">
                      <img src={offlineIcon} alt="" className="w-12 h-12" aria-hidden="true" />
                    </div>
                  )}

                  <div className="prom-streamer-stats grid grid-cols-2 gap-x-4 gap-y-1 text-center">
                    <div className={`flex flex-col items-center ${streamer.isOnline ? '' : '-ml-6'}`}>
                      <img src={strPrizeIcon} alt="" className="w-5 h-5" aria-hidden="true" />
                      <p className="text-base font-semibold text-white">{streamer.totalPrizes ?? 0}</p>
                    </div>
                    <div className="flex flex-col items-center">
                      <img src={dollarIcon} alt="" className="w-4 h-4" aria-hidden="true" />
                      <p className="mt-1 text-base font-semibold text-[#00FF9D]">{streamer.totalValue ?? "$0.00"}</p>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
      </div>
    </div>
  );
}
