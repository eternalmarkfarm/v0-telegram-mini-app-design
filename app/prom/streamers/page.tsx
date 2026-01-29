"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { apiGet } from "@/lib/api";

const strPrizeIcon = "/prom/str_prize.png";
const dollarIcon = "/prom/dollar.png";
const eyeIcon = "/prom/eye1.png";
const liveStreamingIcon = "/prom/live_2.png";
const offlineIcon = "/prom/user.png";

type StreamerItem = {
  id: number;
  nickname: string;
  avatar?: string | null;
  viewers?: number | null;
  streamStartMs: number;
  totalPrizes: number;
  totalValue: string;
  isOnline: boolean;
};

export default function Streamers() {
  const searchParams = useSearchParams();
  const [nowMs, setNowMs] = useState(Date.now());
  const [streamers, setStreamers] = useState<StreamerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const base = "/prom";
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

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [liveRes, listRes] = await Promise.all([
          apiGet("/streamers/live").catch(() => ({ streamers: [] })),
          apiGet("/streamers").catch(() => ({ streamers: [] })),
        ]);
        const live = liveRes?.streamers ?? [];
        const all = listRes?.streamers ?? [];
        const liveMap = new Map<number, any>();
        live.forEach((s: any) => liveMap.set(s.id, s));
        const merged = all.map((s: any) => {
          const liveRow = liveMap.get(s.id);
          const startedAt = liveRow?.started_at ? Date.parse(liveRow.started_at) : 0;
          return {
            id: s.id,
            nickname: liveRow?.twitch_display_name || s.display_name || s.twitch_login || `#${s.id}`,
            avatar: liveRow?.profile_image_url || null,
            viewers: liveRow?.viewer_count ?? 0,
            streamStartMs: startedAt || 0,
            totalPrizes: 0,
            totalValue: "$0.00",
            isOnline: Boolean(liveRow?.is_live),
          } as StreamerItem;
        });
        setStreamers(merged);
      } catch (e) {
        console.error("Failed to load streamers:", e);
        setStreamers([]);
      } finally {
        setLoading(false);
      }
    };
    load();
    const interval = window.setInterval(load, 30000);
    return () => window.clearInterval(interval);
  }, []);

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

  return (
    <div className="max-w-md mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-white mb-6 drop-shadow-[0_0_12px_rgba(91,75,255,0.4)]">
        {onlineOnly ? "Стримеры онлайн" : "Стримеры"}
      </h1>

      <div className="space-y-3">
        {loading ? (
          <div className="yuze-glass rounded-[24px] p-6 text-center text-[#b3b3ff]">
            Загрузка списка...
          </div>
        ) : visibleStreamers.length === 0 ? (
          <div className="yuze-glass rounded-[24px] p-6 text-center text-[#b3b3ff]">
            Онлайн-стримеров пока нет.
          </div>
        ) : (
          <>
            {onlineStreamers.map((streamer) => (
              <Link
                key={streamer.id}
                href={`${base}/streamers/${streamer.id}`}
                className="block yuze-glass rounded-[12px] px-5 py-3 hover:bg-white/[0.14] transition-all duration-300"
              >
                <div className="flex items-center gap-3 -ml-2">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#9146FF] to-[#5B4BFF] rounded-full blur-sm opacity-50"></div>
                    <div className="relative w-14 h-14 rounded-[12px] border border-white/30 overflow-hidden bg-gradient-to-br from-[#101426] to-[#1a2140] flex items-center justify-center">
                      {streamer.avatar ? (
                        <img src={streamer.avatar} alt={streamer.nickname} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs text-[#b3b3ff]">Avatar</span>
                      )}
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg">{streamer.nickname}</h3>
                    {streamer.isOnline && (
                      <div className="flex items-center gap-1 mt-1">
                        <img src={eyeIcon} alt="" className="w-6 h-6" aria-hidden="true" />
                        <span className="text-sm font-semibold text-white">{streamer.viewers ?? 0}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-end gap-4 -mt-2">
                    {streamer.isOnline ? (
                      <div className="flex flex-col items-center gap-0 -mt-1 w-20">
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
                      <div className="flex items-center justify-start w-20 -ml-0.5">
                        <img src={offlineIcon} alt="" className="w-12 h-12" aria-hidden="true" />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-center">
                      <div className={`flex flex-col items-center ${streamer.isOnline ? "" : "-ml-6"}`}>
                        <img src={strPrizeIcon} alt="" className="w-5 h-5" aria-hidden="true" />
                        <p className="text-base font-semibold text-white">{streamer.totalPrizes}</p>
                      </div>
                      <div className="flex flex-col items-center">
                        <img src={dollarIcon} alt="" className="w-4 h-4" aria-hidden="true" />
                        <p className="mt-1 text-base font-semibold text-[#00FF9D]">{streamer.totalValue}</p>
                      </div>
                    </div>
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
                className="block yuze-glass rounded-[12px] px-5 py-3 hover:bg-white/[0.14] transition-all duration-300"
              >
                <div className="flex items-center gap-3 -ml-2">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-[#9146FF] to-[#5B4BFF] rounded-full blur-sm opacity-50"></div>
                    <div className="relative w-14 h-14 rounded-[12px] border border-white/30 overflow-hidden bg-gradient-to-br from-[#101426] to-[#1a2140] flex items-center justify-center">
                      {streamer.avatar ? (
                        <img src={streamer.avatar} alt={streamer.nickname} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs text-[#b3b3ff]">Avatar</span>
                      )}
                    </div>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-white font-bold text-lg">{streamer.nickname}</h3>
                  </div>

                  <div className="flex items-end gap-4 -mt-2">
                    <div className="flex items-center justify-start w-20 -ml-0.5">
                      <img src={offlineIcon} alt="" className="w-12 h-12" aria-hidden="true" />
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-center">
                      <div className="flex flex-col items-center -ml-6">
                        <img src={strPrizeIcon} alt="" className="w-5 h-5" aria-hidden="true" />
                        <p className="text-base font-semibold text-white">{streamer.totalPrizes}</p>
                      </div>
                      <div className="flex flex-col items-center">
                        <img src={dollarIcon} alt="" className="w-4 h-4" aria-hidden="true" />
                        <p className="mt-1 text-base font-semibold text-[#00FF9D]">{streamer.totalValue}</p>
                      </div>
                    </div>
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
