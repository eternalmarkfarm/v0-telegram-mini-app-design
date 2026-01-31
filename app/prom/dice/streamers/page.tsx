"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import StarsBurst from "@/app/prom/components/StarsBurst";
import { apiPost } from "@/lib/api";
import { ensureAuth } from "@/lib/ensureAuth";
import useSWR from "swr";
import { REFRESH_LIVE } from "@/app/prom/lib/refresh";

const leftArrowIcon = "/prom/left-arrow.svg";
const star = "/prom/star.svg";
const starDon = "/prom/star_don.svg";
const infoIcon = "/prom/info_notice.svg";

type LiveStreamer = {
  id: number;
  nickname: string;
  avatar?: string | null;
  matchStartMs: number;
  matchId?: number | null;
  matchStatus?: string | null;
};

export default function DiceStreamers() {
  const router = useRouter();
  const [nowMs, setNowMs] = useState(Date.now());
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [streamers, setStreamers] = useState<LiveStreamer[]>([]);
  const [amounts, setAmounts] = useState<Record<number, string>>({});
  const [sendingId, setSendingId] = useState<number | null>(null);

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setNowMs(Date.now());
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, []);

  const { data } = useSWR("/streamers/live", undefined, { refreshInterval: REFRESH_LIVE });

  const mappedStreamers = useMemo(() => {
    return (data?.streamers ?? []).map((s: any) => ({
      id: s.id,
      nickname: s.twitch_display_name || s.twitch_login || `#${s.id}`,
      avatar: s.profile_image_url || null,
      matchStartMs: s.match_started_at
        ? Date.parse(s.match_started_at)
        : s.started_at
          ? Date.parse(s.started_at)
          : 0,
      matchId: s.match_id ?? null,
      matchStatus: s.match_status ?? null,
    }));
  }, [data]);

  useEffect(() => {
    setStreamers(mappedStreamers);
  }, [mappedStreamers]);

  const formatDuration = (startMs: number, currentMs: number) => {
    const totalSeconds = Math.max(0, Math.floor((currentMs - startMs) / 1000));
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    return {
      hours: String(hours).padStart(2, "0"),
      minutes: String(minutes).padStart(2, "0"),
    };
  };

  const handleSend = async (streamer: LiveStreamer) => {
    try {
      const raw = (amounts[streamer.id] ?? "").trim();
      const stars = Number.parseInt(raw || "0", 10);
      const isMatchActive = streamer.matchStatus === "live";
      if (!streamer.matchId || !isMatchActive) {
        alert("Донат доступен только во время матча.");
        return;
      }
      if (!Number.isFinite(stars) || stars <= 0) {
        alert("Введите количество Stars больше 0.");
        return;
      }
      setSendingId(streamer.id);
      await ensureAuth();
      const res = await apiPost("/dice/contribute", {
        match_id: streamer.matchId,
        stars_amount: stars,
      });
      const invoiceUrl = res?.invoice_url;
      if (!invoiceUrl) {
        throw new Error("Ссылка на оплату не получена");
      }
      const tg = (window as any)?.Telegram?.WebApp;
      if (tg?.openInvoice) {
        tg.openInvoice(invoiceUrl);
      } else if (tg?.openLink) {
        tg.openLink(invoiceUrl);
      } else {
        window.open(invoiceUrl, "_blank");
      }
    } catch (e) {
      console.error("Failed to create invoice:", e);
      alert("Не удалось создать счет. Попробуйте еще раз.");
    } finally {
      setSendingId(null);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-5">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="w-8 h-8 rounded-[8px] bg-white/5 border border-white/10 flex items-center justify-center"
          aria-label="Назад"
        >
          <img src={leftArrowIcon} alt="" className="w-5 h-5" aria-hidden="true" />
        </button>
        <h1 className="text-white font-bold text-lg">Стримеры онлайн</h1>
        <div className="flex-1" />
        <StarsBurst className="relative h-[120px] w-[150px] -my-6 translate-x-6" starClassName="h-10 w-10" />
      </div>

      <button
        type="button"
        onClick={() => setIsInfoOpen((prev) => !prev)}
        className="relative w-full rounded-[8px] px-4 py-3 bg-[#4a4f62] overflow-visible text-left"
        aria-expanded={isInfoOpen}
      >
        <div className="flex items-start gap-3">
          <img src={infoIcon} alt="" className="w-7 h-7" aria-hidden="true" />
          <div className="flex-1 text-[12px] leading-snug text-white/85">
            {isInfoOpen ? (
              <>
                <span className="block text-[16px] leading-tight font-['Space_Grotesk'] text-white/90">
                  Вы можете замотивировать любого стримера, отправив ему Stars Telegram. В чате стрима отобразится сколько Stars вы отправили. Если стример проиграет игру все Stars вернуться каждому отправителю обратно, и стример ничего не получит, ибо проиграл!
                </span>
                <span className="mt-2 flex items-center gap-2 text-[16px] font-['Space_Grotesk'] text-white/90">
                  Больше <img src={star} alt="" className="h-4 w-4" aria-hidden="true" /> <span className="text-[18px] text-white/70">→</span> сильнее цепляется за победу!
                </span>
              </>
            ) : (
              <span className="block text-center text-[24px] font-['Space_Grotesk'] text-white/95 font-semibold -translate-x-2">
                Прочитай меня
              </span>
            )}
          </div>
          <ChevronDown
            className={`ml-2 self-end mb-0 w-5 h-5 text-[#b3b3ff] transition-transform ${
              isInfoOpen ? "rotate-180" : ""
            }`}
          />
        </div>
      </button>

      <div className="space-y-3">
        {streamers.map((streamer) => (
          <div
            key={streamer.id}
            className="yuze-glass rounded-[12px] px-5 py-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3 -ml-4">
              <div className="relative w-12 h-12 rounded-[12px] overflow-hidden border border-white/20 bg-gradient-to-br from-[#101426] to-[#1a2140]">
                {streamer.avatar ? (
                  <img src={streamer.avatar} alt={streamer.nickname} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-xs text-[#b3b3ff]">Avatar</span>
                )}
              </div>
              <div className="flex flex-col -mt-0.5">
                <span className="text-white font-semibold text-base">{streamer.nickname}</span>
                {streamer.matchStatus === "live" ? (
                  <span className="text-[12px] text-white/70 font-medium">
                    {formatDuration(streamer.matchStartMs, nowMs).hours}
                    <span className="mx-0.5 blink-strong">:</span>
                    {formatDuration(streamer.matchStartMs, nowMs).minutes}
                  </span>
                ) : (
                  <span className="text-[12px] text-white/50 font-medium">Матч не идет</span>
                )}
              </div>
              <img src={starDon} alt="" className="w-8 h-8 ml-1" aria-hidden="true" />
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="0"
                className="w-16 h-8 ml-2 rounded-[6px] bg-white/10 border border-white/15 text-white text-sm px-2 text-center outline-none"
                value={amounts[streamer.id] ?? ""}
                onChange={(e) =>
                  setAmounts((prev) => ({ ...prev, [streamer.id]: e.target.value }))
                }
                disabled={streamer.matchStatus !== "live"}
              />
            </div>
            <button
              type="button"
              onClick={() => handleSend(streamer)}
              disabled={
                sendingId === streamer.id ||
                streamer.matchStatus !== "live"
              }
              className="px-4 py-1.5 rounded-[10px] text-[15px] font-['Space_Grotesk'] font-semibold text-[#3b2a00] shadow-[0_8px_18px_rgba(255,200,61,0.35)] bg-gradient-to-r from-[#FFD666] to-[#FFC83D] hover:brightness-110 active:translate-y-[1px] transition"
            >
              {sendingId === streamer.id ? "..." : "Отправить"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
