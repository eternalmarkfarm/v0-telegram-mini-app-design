"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import PrizeCard, { PrizeData } from "@/app/prom/components/PrizeCard";
import { apiGet } from "@/lib/api";
import { getEventLabel } from "@/lib/event-labels";

const starTg = "/prom/star_tg.png";
const chooseStream = "/prom/choosing.png";
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
          className="cta-sheen relative flex h-[72px] w-full items-center justify-center gap-2 rounded-[8px] px-5 py-0 text-center text-white font-semibold uppercase shadow-[0_10px_24px_rgba(75,123,255,0.22)] transition-transform duration-200 active:translate-y-[1px]"
          style={{ background: "linear-gradient(90deg, #ffffff 0 15%, #3a63e6 15% 85%, #ffffff 85% 100%)" }}
        >
          <img src={chooseStream} alt="" className="absolute left-[7.5%] h-11 w-11 -translate-x-1/2" />
          <span className="absolute left-[15%] top-[14px] w-[70%] text-center leading-tight">
            <span className="block whitespace-nowrap text-[15px] text-white">Выбери своего стримера</span>
            <span className="block whitespace-nowrap text-[10px] text-white">Мотивация на WIN</span>
          </span>
          <img
            src={starTg}
            alt="Star"
            className="spin-star absolute left-[92.5%] h-9 w-9 -translate-x-1/2"
            style={{ filter: "brightness(1.4)" }}
          />
        </Link>
      </div>
      <div className="flex flex-col items-center gap-1">
        <div className="w-24 h-[2px] bg-white/30 mt-6" />
        <img src={vsIcon} alt="" className="w-40 h-40 opacity-90" aria-hidden="true" />
        <img src={vsLogoIcon} alt="" className="w-64 h-64 opacity-90 -mt-32" aria-hidden="true" />
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
