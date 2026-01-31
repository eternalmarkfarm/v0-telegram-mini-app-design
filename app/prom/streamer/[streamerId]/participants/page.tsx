"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { apiGet } from "@/lib/api";

const leftArrowIcon = "/prom/left-arrow.svg";

type ParticipantItem = {
  twitch_login: string | null;
  last_chat_at?: string | null;
};

export default function StreamerParticipants() {
  const router = useRouter();
  const params = useParams();
  const streamerId = Array.isArray(params?.streamerId)
    ? params.streamerId[0]
    : params?.streamerId;
  const [items, setItems] = useState<ParticipantItem[]>([]);

  useEffect(() => {
    if (!streamerId) return;
    const load = async () => {
      try {
        const res = await apiGet(`/streamers/${streamerId}/participants?limit=200`);
        setItems(res?.items ?? []);
      } catch (e) {
        console.error("Failed to load participants:", e);
        setItems([]);
      }
    };
    load();
    const interval = window.setInterval(load, 10000);
    return () => window.clearInterval(interval);
  }, [streamerId]);

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
        <h1 className="text-white font-bold text-lg">Сейчас участвуют</h1>
      </div>

      <div className="yuze-glass rounded-[16px] px-4 py-3 text-sm text-[#b3b3ff]">
        Показаны участники, которые сейчас соответствуют условиям участия и недавно были в чате.
      </div>

      <div className="space-y-2">
        {items.map((item, idx) => (
          <div
            key={`${item.twitch_login ?? "viewer"}-${idx}`}
            className="yuze-glass rounded-[12px] px-4 py-3 text-white font-semibold"
          >
            @{item.twitch_login || "viewer"}
          </div>
        ))}
        {items.length === 0 && (
          <div className="text-sm text-[#b3b3ff]">Пока нет участников.</div>
        )}
      </div>
    </div>
  );
}
