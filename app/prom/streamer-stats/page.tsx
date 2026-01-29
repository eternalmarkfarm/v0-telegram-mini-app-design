"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import PrizeCard, { PrizeData } from "@/app/prom/components/PrizeCard";
import { apiGet } from "@/lib/api";
import { ensureAuth } from "@/lib/ensureAuth";
import { getEventLabel } from "@/lib/event-labels";
const leftArrow = "/prom/left-arrow.png";
const dollarSignIcon = "/prom/dollar-sign.png";
const strPrizeIcon = "/prom/str_prize.png";
const approvedIcon = "/prom/approved.png";
const rewardIcon = "/prom/medal_new.png";
const menuBarIcon = "/prom/menu-bar1.png";


const BASE_SERIES = [
  112, 118, 105, 123, 129, 121, 134, 142, 139, 150, 146, 155, 160, 158,
  172, 168, 181, 176, 190, 185, 197, 210, 204, 218, 212, 226, 234, 229,
  241, 248, 242, 255, 262, 258, 270, 276, 268, 283, 291, 286,
];

const DAY_OPTIONS = [7, 14, 30] as const;

const mapStatus = (status?: string | null): PrizeData["status"] => {
  if (status === "success") return "received";
  if (status === "not_claimed" || status === "failed") return "missed";
  if (status === "sent") return "sent";
  return "processing";
};

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

function getSeries(days: number) {
  if (days >= BASE_SERIES.length) {
    return BASE_SERIES;
  }
  const step = Math.floor(BASE_SERIES.length / days);
  const start = BASE_SERIES.length - days * step;
  const result: number[] = [];
  for (let i = 0; i < days; i += 1) {
    result.push(BASE_SERIES[start + i * step]);
  }
  return result;
}

function buildLinePath(values: number[], width: number, height: number) {
  if (values.length === 0) return "";
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = Math.max(max - min, 1);
  const step = width / (values.length - 1);
  return values
    .map((v, i) => {
      const x = i * step;
      const y = height - ((v - min) / range) * height;
      return `${i === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");
}

function buildAreaPath(values: number[], width: number, height: number) {
  const line = buildLinePath(values, width, height);
  if (!line) return "";
  return `${line} L ${width} ${height} L 0 ${height} Z`;
}

export default function StreamerStats() {
  const [days, setDays] = useState<(typeof DAY_OPTIONS)[number]>(14);
  const [seriesData, setSeriesData] = useState<number[]>(BASE_SERIES);
  const [totalSpent, setTotalSpent] = useState("$0.00");
  const [totalSkins, setTotalSkins] = useState("0");
  const [todayIssued, setTodayIssued] = useState("0");
  const [issuedPrizes, setIssuedPrizes] = useState<PrizeData[]>([]);
  const series = useMemo(() => (seriesData.length ? seriesData : getSeries(days)), [days, seriesData]);
  const deltas = useMemo(
    () =>
      series.map((value, index) =>
        index === 0 ? 0 : value - series[index - 1]
      ),
    [series]
  );
  const totalNew = useMemo(
    () => deltas.slice(1).reduce((sum, value) => sum + value, 0),
    [deltas]
  );
  const latest = series[series.length - 1] ?? 0;
  const prev = series[series.length - 2] ?? latest;
  const delta = latest - prev;
  const deltaPct = prev ? Math.round((delta / prev) * 100) : 0;
  const trendUp = delta >= 0;

  const chartWidth = 320;
  const chartHeight = 120;
  const linePath = useMemo(
    () => buildLinePath(series, chartWidth, chartHeight),
    [series]
  );
  const areaPath = useMemo(
    () => buildAreaPath(series, chartWidth, chartHeight),
    [series]
  );

  const minValue = Math.min(...series);
  const maxValue = Math.max(...series);
  const valueRange = Math.max(maxValue - minValue, 1);
  const barBandHeight = 56;
  useEffect(() => {
    const load = async () => {
      try {
        await ensureAuth();
        const [followersStats, followersToday, streamerMe] = await Promise.all([
          apiGet("/streamer/followers/stats").catch(() => null),
          apiGet("/streamer/followers/today").catch(() => null),
          apiGet("/streamer/me").catch(() => null),
        ]);
        const key = days === 7 ? "5" : days === 14 ? "15" : "30";
        const range = followersStats?.ranges?.[key] ?? [];
        if (Array.isArray(range) && range.length > 0) {
          setSeriesData(range.map((r: any) => Number(r.count ?? 0)));
        }
        if (followersToday?.count_today != null) {
          setTodayIssued(String(followersToday.count_today));
        }
        const streamerId = streamerMe?.streamer?.id;
        if (streamerId) {
          const profile = await apiGet(`/streamers/${streamerId}`);
          const stats = profile?.stats ?? {};
          setTotalSpent(`$${Number(stats.total_amount ?? 0).toFixed(2)}`);
          setTotalSkins(String(stats.total_prizes ?? 0));
          const recent = profile?.recent_prizes ?? [];
          const mapped = recent.map((item: any) => ({
            id: String(item.id),
            streamerName: profile?.streamer?.twitch_login || profile?.streamer?.display_name || "Streamer",
            winnerNick: item.twitch_login || "viewer",
            time: formatTime(item.created_at),
            trigger: getEventLabel(item.event_key),
            deadline: formatTime(item.trade_offer_expiry_at),
            price: item.skin_price ? String(item.skin_price) : "0.00",
            status: mapStatus(item.delivery_status),
            game: "dota",
          })) as PrizeData[];
          setIssuedPrizes(mapped);
        }
      } catch (e) {
        console.error("Failed to load stats:", e);
      }
    };
    load();
  }, [days]);

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6 font-['Space_Grotesk'] text-[17px]">
      <div className="flex items-center gap-3">
        <Link
          href="/prom/stream-panel"
          className="w-10 h-10 flex items-center justify-center rounded-full yuze-glass-soft hover:bg-white/[0.12] transition"
        >
          <img src={leftArrow} alt="Назад" className="w-4 h-4" />
        </Link>
        <h1 className="text-2xl font-bold text-white">Статистика</h1>
      </div>

      <div className="yuze-glass rounded-[22px] p-5">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm text-[#b3b3ff]">Подписчики</p>
            <div className="flex items-baseline gap-3 mt-1">
              <span className="text-3xl font-bold text-white">{latest}</span>
              <span
                className={`text-sm font-semibold ${
                  trendUp ? "text-emerald-300" : "text-red-300"
                }`}
              >
                {trendUp ? "+" : ""}
                {delta} ({trendUp ? "+" : ""}
                {deltaPct}%)
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            {DAY_OPTIONS.map((option) => (
              <button
                key={option}
                onClick={() => setDays(option)}
                className={`px-3 py-1.5 rounded-full text-sm font-semibold transition ${
                  days === option
                    ? "bg-[#5B4BFF] text-white shadow-[0_0_16px_rgba(91,75,255,0.45)]"
                    : "bg-white/10 text-[#d7d7ff] hover:bg-white/20"
                }`}
              >
                {option} дней
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <div className="relative h-[140px] rounded-[18px] bg-[#10131d] border border-white/5 overflow-hidden">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="absolute inset-0 w-full h-full"
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="followersArea" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#5B4BFF" stopOpacity="0.5" />
                  <stop offset="100%" stopColor="#5B4BFF" stopOpacity="0.05" />
                </linearGradient>
              </defs>
              <path d={areaPath} fill="url(#followersArea)" />
              <path
                d={linePath}
                fill="none"
                stroke="#9AA1FF"
                strokeWidth="2.5"
              />
            </svg>
            <div
              className="absolute inset-x-4 bottom-4 grid items-end gap-1"
              style={{
                gridTemplateColumns: `repeat(${series.length}, minmax(0, 1fr))`,
              }}
            >
              {series.map((value, index) => {
                const height =
                  16 + ((value - minValue) / valueRange) * (barBandHeight - 16);
                const deltaValue = deltas[index];
                return (
                  <div
                    key={`${value}-${index}`}
                    className="relative flex items-end justify-center"
                    style={{ height: `${barBandHeight}px` }}
                  >
                    <div
                      className="w-full rounded-full bg-white/10"
                      style={{ height: `${height}px` }}
                    />
                    {days !== 30 && (
                      <span
                        className="absolute bottom-1 text-[9px] leading-none text-white/80"
                        style={{ textShadow: "0 0 6px rgba(0,0,0,0.6)" }}
                      >
                        {deltaValue >= 0 ? "+" : ""}
                        {deltaValue}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            {days === 30 && (
              <div className="absolute top-4 left-4 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                +{totalNew} за 30 дней
              </div>
            )}
          </div>
          <div className="mt-3 text-xs text-[#9aa1ff] flex items-center justify-between">
            <span>Последние {days} дней</span>
            <span>Обновлено: сегодня</span>
          </div>
        </div>
      </div>

      <div className="yuze-glass-soft rounded-[20px] p-5">
        <div className="grid grid-cols-3 divide-x divide-white/10">
          <div className="flex items-center gap-3 pr-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <img src={dollarSignIcon} alt="" className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs text-[#b3b3ff]">Потрачено</p>
              <p className="text-base font-bold text-white">{totalSpent}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 px-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <img src={strPrizeIcon} alt="" className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs text-[#b3b3ff]">Скинов всего</p>
              <p className="text-base font-bold text-white">{totalSkins}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 pl-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <img src={approvedIcon} alt="" className="w-6 h-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-xs text-[#b3b3ff]">Выдано сегодня</p>
              <p className="text-base font-bold text-white">{todayIssued}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-1">
        <h3 className="text-white font-bold text-lg flex items-center gap-2">
          <img src={rewardIcon} alt="" className="w-6 h-6" aria-hidden="true" />
          <span>Выданные призы</span>
        </h3>
        <Link href="/prom/streamer-prizes" className="inline-flex">
          <img src={menuBarIcon} alt="" className="w-4.5 h-4.5 mr-2 mt-1" aria-hidden="true" />
        </Link>
      </div>
      <div className="space-y-2">
        {issuedPrizes.map((prize) => (
          <PrizeCard key={prize.id} prize={prize} />
        ))}
      </div>

    </div>
  );
}
