"use client";

import { useMemo, useState } from 'react';
import { useRouter } from "next/navigation";
import PrizeCard, { PrizeData } from '@/app/prom/components/PrizeCard';
import { apiGetFresh, apiPost } from "@/lib/api";
import { ensureAuth } from "@/lib/ensureAuth";
import { getEventLabel } from "@/lib/event-labels";
import { useViewerStatus } from "@/app/prom/lib/useViewerStatus";
import { formatPrizeTime, mapPrizeStatus } from "@/app/prom/lib/prize-utils";
import useSWR from "swr";
import { REFRESH_PRIZES, REFRESH_PROFILE } from "@/app/prom/lib/refresh";
import { readCache, writeCache } from "@/lib/cache";
const rewardIcon = "/prom/medal_new.svg";
const leftArrowIcon = "/prom/left-arrow.svg";


export default function Prizes() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'all' | 'my'>('all');
  const { twitchLogin } = useViewerStatus();

  const { data: profile } = useSWR("/viewer/profile", undefined, { refreshInterval: REFRESH_PROFILE });

  const fetchPrizes = async () => {
    await ensureAuth();
    // Status refresh is expensive (hits Lis-Skins). Throttle it.
    const refreshedRecently = readCache<boolean>("prom:viewer:prizes:refresh", 60 * 1000);
    if (!refreshedRecently) {
      await apiPost("/viewer/prizes/refresh", {});
      writeCache("prom:viewer:prizes:refresh", true);
    }
    return apiGetFresh("/viewer/prizes?limit=30");
  };

  const { data: prizeRes } = useSWR("/viewer/prizes?limit=30", fetchPrizes, {
    refreshInterval: REFRESH_PRIZES,
  });

  const mappedItems = useMemo(() => {
    const avatar = profile?.profile_image_url ?? null;
    const resItems = prizeRes?.items ?? [];
    return resItems.map((item: any) => ({
      id: String(item.id),
      streamerName: item.streamer?.twitch_login || item.streamer?.display_name || "Streamer",
      winnerNick: twitchLogin || "you",
      winnerAvatar: avatar ?? undefined,
      time: formatPrizeTime(item.created_at),
      trigger: getEventLabel(item.event_key),
      deadline: formatPrizeTime(item.trade_offer_expiry_at),
      price: item.skin_price ? String(item.skin_price) : "0.00",
      status: mapPrizeStatus(item.delivery_status),
      game: "dota",
    })) as PrizeData[];
  }, [prizeRes, profile, twitchLogin]);

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
        <img src={rewardIcon} alt="" className="w-6 h-6" aria-hidden="true" />
        <h1 className="text-white font-bold text-lg">Выданные призы</h1>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => setActiveTab('all')}
          className={`text-sm font-semibold transition-all ${
            activeTab === 'all' ? 'text-white' : 'text-[#b3b3ff]'
          }`}
        >
          Все
        </button>
        <button
          onClick={() => setActiveTab('my')}
          className={`text-sm font-semibold transition-all ${
            activeTab === 'my' ? 'text-white' : 'text-[#b3b3ff]'
          }`}
        >
          Мои
        </button>
      </div>

      <div className="space-y-3">
        {mappedItems.map((prize) => (
          <PrizeCard key={prize.id} prize={prize} />
        ))}
      </div>
    </div>
  );
}
