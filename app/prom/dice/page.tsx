"use client";

import { useEffect } from "react";
import Link from "next/link";
import PrizeCard, { PrizeData } from "@/app/prom/components/PrizeCard";
import useSWR from "swr";
import { apiGetFresh } from "@/lib/api";
import { readCache, writeCache } from "@/lib/cache";
import { getEventLabel } from "@/lib/event-labels";
import { formatPrizeTime, mapPrizeStatus } from "@/app/prom/lib/prize-utils";
import { REFRESH_PRIZES } from "@/app/prom/lib/refresh";

const chooseStream = "/prom/choosing.svg";
const vsIcon = "/prom/vs_illustration_19920256.png";
const vsLogoIcon = "/prom/vs_logo_3d_5985078.png";

export default function Dice() {
  const cached = readCache<PrizeData[]>("prom:dice:recent") ?? [];

  const fetchPrizes = async () => {
    const res = await apiGetFresh("/public/recent-prizes?limit=10");
    const items = res?.items ?? [];
    return items.map((item: any) => {
      const time = formatPrizeTime(item.created_at);
      const deadline = item.trade_offer_expiry_at ? formatPrizeTime(item.trade_offer_expiry_at) : time;
      return {
        id: String(item.id),
        streamerName: item.streamer?.twitch_login || item.streamer?.display_name || "Streamer",
        winnerNick: item.winner_twitch_login || "viewer",
        winnerAvatar: item.winner_profile_image_url || undefined,
        time,
        trigger: getEventLabel(item.event_key),
        deadline,
        price: item.skin_price ? String(item.skin_price) : "0.00",
        status: mapPrizeStatus(item.delivery_status),
        game: "dota",
      } as PrizeData;
    });
  };

  const { data: prizes = cached } = useSWR("/public/recent-prizes?limit=10", fetchPrizes, {
    refreshInterval: REFRESH_PRIZES,
    fallbackData: cached,
  });

  useEffect(() => {
    if (prizes.length > 0) writeCache("prom:dice:recent", prizes);
  }, [prizes]);

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      <div className="space-y-1">
        <Link
          href="/dice/streamers"
          className="cta-sheen relative flex h-[64px] w-full items-center rounded-[10px] px-4 text-white font-semibold shadow-[0_10px_24px_rgba(75,123,255,0.22)] transition-transform duration-200 active:translate-y-[1px]"
          style={{ background: "linear-gradient(90deg, rgba(46,99,230,0.18), rgba(58,99,230,0.65) 45%, rgba(46,99,230,0.18))" }}
        >
          <img
            src={chooseStream}
            alt=""
            className="h-10 w-10 shrink-0 ml-2"
            aria-hidden="true"
          />
          <span className="flex-1 text-center text-[15px] font-semibold text-white -ml-2">
            Выбери своего стримера
          </span>
        </Link>
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="w-24 h-[2px] bg-white/30 mt-14" />
        <span className="mt-0 text-[11px] font-semibold tracking-[0.3em] text-white/70">PvP</span>
        <img src={vsLogoIcon} alt="" className="w-64 h-64 opacity-90 -mt-24" aria-hidden="true" />
      </div>
      <div className="flex justify-center">
        <div className="flex flex-col items-center -mt-24">
          <span className="text-[11px] font-semibold tracking-[0.4em] text-white/70 mb-1">СКОРО</span>
          <div className="w-24 h-[2px] bg-white/30" />
        </div>
      </div>
      <div className="space-y-3">
        {prizes.map((prize) => (
          <PrizeCard key={prize.id} prize={prize} />
        ))}
      </div>
    </div>
  );
}
