"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PrizeCard, { PrizeData } from "@/app/prom/components/PrizeCard";
import { apiGet } from "@/lib/api";
import { getEventLabel } from "@/lib/event-labels";

const chooseStream = "/prom/choosing.svg";
const vsIcon = "/prom/vs_illustration_19920256.png";
const vsLogoIcon = "/prom/vs_logo_3d_5985078.png";

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

export default function Dice() {
  const [prizes, setPrizes] = useState<PrizeData[]>([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await apiGet("/public/recent-prizes?limit=10");
        const mapped = (res?.items ?? []).map((item: any) => {
          const time = formatTime(item.created_at);
          return {
            id: String(item.id),
            streamerName: item.streamer?.twitch_login || item.streamer?.display_name || "Streamer",
            winnerNick: item.winner_twitch_login || "viewer",
            winnerAvatar: item.winner_profile_image_url || undefined,
            time,
            trigger: getEventLabel(item.event_key),
            deadline: time,
            price: item.skin_price ? String(item.skin_price) : "0.00",
            status: mapStatus(item.delivery_status),
            game: "dota",
          } as PrizeData;
        });
        setPrizes(mapped);
      } catch (e) {
        console.error("Failed to load dice prizes:", e);
        setPrizes([]);
      }
    };
    load();
  }, []);

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      <div className="space-y-1">
        <Link
          href="/prom/dice/streamers"
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
