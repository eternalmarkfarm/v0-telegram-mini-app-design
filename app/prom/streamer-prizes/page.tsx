"use client";

import { useMemo } from "react";
import Link from "next/link";
import PrizeCard, { PrizeData } from "@/app/prom/components/PrizeCard";
import { apiGetFresh, apiPost } from "@/lib/api";
import { ensureAuth } from "@/lib/ensureAuth";
import { getEventLabel } from "@/lib/event-labels";
import { formatPrizeTime, mapPrizeStatus } from "@/app/prom/lib/prize-utils";
import useSWR from "swr";
import { REFRESH_PRIZES, REFRESH_STATS } from "@/app/prom/lib/refresh";
const rewardIcon = "/prom/medal_new.svg";
const leftArrowIcon = "/prom/left-arrow.svg";


export default function StreamerPrizes() {
  const fetchMe = async () => {
    await ensureAuth();
    return apiGetFresh("/streamer/me");
  };

  const { data: me } = useSWR("/streamer/me", fetchMe, { refreshInterval: REFRESH_STATS });
  const streamerId = me?.streamer?.id;

  const fetchPrizes = async () => {
    await ensureAuth();
    await apiPost("/streamer/lis-skins/refresh", {}).catch(() => {});
    return apiGetFresh(`/streamers/${streamerId}/prizes?limit=50&offset=0`);
  };

  const { data: prizeRes } = useSWR(
    streamerId ? `/streamers/${streamerId}/prizes?limit=50&offset=0` : null,
    fetchPrizes,
    { refreshInterval: REFRESH_PRIZES }
  );

  const mappedItems = useMemo(() => {
    const resItems = prizeRes?.items ?? [];
    return resItems.map((item: any) => ({
      id: String(item.id),
      streamerName: me?.streamer?.twitch_login || me?.streamer?.display_name || "Streamer",
      winnerNick: item.twitch_login || "viewer",
      winnerAvatar: item.winner_profile_image_url || undefined,
      time: formatPrizeTime(item.created_at),
      trigger: getEventLabel(item.event_key),
      deadline: formatPrizeTime(item.trade_offer_expiry_at),
      price: item.skin_price ? String(item.skin_price) : "0.00",
      status: mapPrizeStatus(item.delivery_status),
      game: "dota",
    })) as PrizeData[];
  }, [prizeRes, me]);

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center gap-2">
        <Link
          href="/streamer-stats"
          className="w-8 h-8 rounded-[8px] bg-white/5 border border-white/10 flex items-center justify-center"
          aria-label="Назад"
        >
          <img src={leftArrowIcon} alt="" className="w-5 h-5" aria-hidden="true" />
        </Link>
        <img src={rewardIcon} alt="" className="w-6 h-6" aria-hidden="true" />
        <h1 className="text-white font-bold text-lg">Выданные призы</h1>
      </div>

      <div className="space-y-3">
        {mappedItems.map((prize) => (
          <PrizeCard key={prize.id} prize={prize} />
        ))}
      </div>
    </div>
  );
}
