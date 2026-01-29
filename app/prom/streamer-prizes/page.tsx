"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PrizeCard, { PrizeData } from "@/app/prom/components/PrizeCard";
import { apiGet } from "@/lib/api";
import { ensureAuth } from "@/lib/ensureAuth";
import { getEventLabel } from "@/lib/event-labels";
const rewardIcon = "/prom/medal_new.png";
const leftArrowIcon = "/prom/left-arrow.png";


const formatTime = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).replace(",", "");
};

const mapStatus = (status?: string | null): PrizeData["status"] => {
  if (status === "success") return "received";
  if (status === "not_claimed" || status === "failed") return "missed";
  if (status === "sent") return "sent";
  return "processing";
};

export default function StreamerPrizes() {
  const [items, setItems] = useState<PrizeData[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        await ensureAuth();
        const me = await apiGet("/streamer/me");
        const streamerId = me?.streamer?.id;
        if (!streamerId) return;
        const res = await apiGet(`/streamers/${streamerId}/prizes?limit=50&offset=0`);
        const mapped = (res?.items ?? []).map((item: any) => ({
          id: String(item.id),
          streamerName: me?.streamer?.twitch_login || me?.streamer?.display_name || "Streamer",
          winnerNick: item.twitch_login || "viewer",
          winnerAvatar: item.winner_profile_image_url || undefined,
          time: formatTime(item.created_at),
          trigger: getEventLabel(item.event_key),
          deadline: formatTime(item.trade_offer_expiry_at),
          price: item.skin_price ? String(item.skin_price) : "0.00",
          status: mapStatus(item.delivery_status),
          game: "dota",
        })) as PrizeData[];
        setItems(mapped);
      } catch (e) {
        console.error("Failed to load streamer prizes:", e);
        setItems([]);
      }
    };
    load();
  }, []);
  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-4">
      <div className="flex items-center gap-2">
        <Link
          href="/prom/streamer-stats"
          className="w-8 h-8 rounded-[8px] bg-white/5 border border-white/10 flex items-center justify-center"
          aria-label="Назад"
        >
          <img src={leftArrowIcon} alt="" className="w-5 h-5" aria-hidden="true" />
        </Link>
        <img src={rewardIcon} alt="" className="w-6 h-6" aria-hidden="true" />
        <h1 className="text-white font-bold text-lg">Выданные призы</h1>
      </div>

      <div className="space-y-3">
        {items.map((prize) => (
          <PrizeCard key={prize.id} prize={prize} />
        ))}
      </div>
    </div>
  );
}
