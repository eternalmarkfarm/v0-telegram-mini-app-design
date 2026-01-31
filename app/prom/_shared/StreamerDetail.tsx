"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { TrendingUp } from "lucide-react";
import PrizeCard, { PrizeData } from "@/app/prom/components/PrizeCard";
import { apiDelete, apiGet, apiPost } from "@/lib/api";
import { ensureAuth } from "@/lib/ensureAuth";
import { getEventLabel } from "@/lib/event-labels";
import { buildCacheKey, readCache, writeCache } from "@/app/prom/lib/cache";

const leftArrowIcon = "/prom/left-arrow.svg";
const avatarCircle = "/prom/circle.svg";
const addUserIcon = "/prom/add-user.svg";
const deleteUserIcon = "/prom/delete-user.svg";
const liveIcon = "/prom/live_badge.svg";
const eyeIcon = "/prom/eye1.svg";
const rewardIcon = "/prom/medal_new.svg";
const trophyIcon = "/prom/trophy.svg";
const unicIcon = "/prom/unic.svg";
const dollarSignIcon = "/prom/dollar-sign.svg";
const customerExperienceIcon = "/prom/customer-experience.svg";
const checklistIcon = "/prom/checklist.svg";
const termsIcon = "/prom/terms_notice.svg";
const insuranceIcon = "/prom/insurance.svg";
const checkIcon = "/prom/check.svg";
const closeIcon = "/prom/close.svg";

const SHOW_FAKE_STREAMER = process.env.NODE_ENV !== "production";

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

type StreamerProfile = {
  streamer: {
    id: number;
    display_name?: string | null;
    twitch_login?: string | null;
    profile_image_url?: string | null;
    twitch_display_name?: string | null;
    telegram_channel_url?: string | null;
  };
  live: {
    is_live?: boolean;
    viewer_count?: number;
    started_at?: string | null;
  };
  stats: {
    total_prizes?: number;
    total_amount?: number;
    stream_prizes?: number;
    stream_amount?: number;
    stream_participants?: number;
  };
  recent_prizes: Array<any>;
};

type Eligibility = {
  is_tracked?: boolean;
  is_follower?: boolean;
  chat_recent?: boolean;
  has_twitch?: boolean;
  has_steam?: boolean;
};

type TabType = "stats" | "events" | "conditions";

export default function StreamerDetail() {
  const params = useParams();
  const streamerId = typeof params?.streamerId === "string" ? params.streamerId : params?.streamerId?.[0];
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("stats");
  const cacheKeyBase = useMemo(
    () => (streamerId ? buildCacheKey(`prom:streamer:${streamerId}`) : null),
    [streamerId],
  );
  const profileCacheKey = cacheKeyBase ? `${cacheKeyBase}:profile` : null;
  const eligibilityCacheKey = cacheKeyBase ? `${cacheKeyBase}:eligibility` : null;
  const eventsCacheKey = cacheKeyBase ? `${cacheKeyBase}:events` : null;

  const [profile, setProfile] = useState<StreamerProfile | null>(() =>
    profileCacheKey ? readCache<StreamerProfile>(profileCacheKey) : null,
  );
  const [eligibility, setEligibility] = useState<Eligibility | null>(() =>
    eligibilityCacheKey ? readCache<Eligibility>(eligibilityCacheKey) : null,
  );
  const [isFollowed, setIsFollowed] = useState(() =>
    eligibilityCacheKey ? Boolean(readCache<Eligibility>(eligibilityCacheKey)?.is_tracked) : false,
  );
  const [events, setEvents] = useState<Array<{ id: string; name: string; isActive: boolean }>>(() =>
    eventsCacheKey ? readCache<Array<{ id: string; name: string; isActive: boolean }>>(eventsCacheKey) ?? [] : [],
  );

  useEffect(() => {
    if (!streamerId) return;
    const load = async () => {
      try {
        const res = await apiGet(`/streamers/${streamerId}`);
        setProfile(res);
        if (profileCacheKey) writeCache(profileCacheKey, res);
      } catch (e) {
        console.error("Failed to load streamer profile:", e);
      }
    };
    load();
  }, [streamerId, profileCacheKey]);

  useEffect(() => {
    if (!streamerId) return;
    const load = async () => {
      try {
        await ensureAuth();
        const res = await apiGet(`/viewer/eligibility?streamer_id=${streamerId}`);
        setEligibility(res);
        setIsFollowed(Boolean(res?.is_tracked));
        if (eligibilityCacheKey) writeCache(eligibilityCacheKey, res);
      } catch (e) {
        console.error("Failed to load eligibility:", e);
      }
    };
    load();
  }, [streamerId, eligibilityCacheKey]);

  useEffect(() => {
    if (!streamerId) return;
    const load = async () => {
      try {
        const res = await apiGet(`/streamers/${streamerId}/events`);
        const items = (res?.items ?? []).map((item: any) => ({
          id: String(item.event_key ?? item.id ?? Math.random()),
          name: getEventLabel(item.event_key) || item.event_key,
          isActive: Boolean(item.enabled),
        }));
        setEvents(items);
        if (eventsCacheKey) writeCache(eventsCacheKey, items);
      } catch (e) {
        console.error("Failed to load events:", e);
      }
    };
    load();
  }, [streamerId, eventsCacheKey]);

  const streamTitle = profile?.streamer?.twitch_display_name || profile?.streamer?.display_name || profile?.streamer?.twitch_login || "Streamer";
  const avatarSrc = profile?.streamer?.profile_image_url || "/prom/twitch_avatar.webp";
  const twitchLogin = profile?.streamer?.twitch_login;
  const liveViewers = profile?.live?.viewer_count ?? 0;
  const participants = profile?.stats?.total_participants ?? 0;
  const totalAmount = profile?.stats?.total_amount ?? 0;
  const uniqueWinners = profile?.stats?.unique_winners ?? 0;
  const streamParticipants = profile?.stats?.stream_participants ?? 0;
  const totalAmountLabel = Number.isFinite(Number(totalAmount)) ? `$${Number(totalAmount).toFixed(2)}` : "$0.00";

  const recentPrizes = useMemo(() => {
    const mapped = (profile?.recent_prizes ?? []).map((item: any) => ({
      id: String(item.id),
      streamerName: twitchLogin || streamTitle,
      winnerNick: item.twitch_login || "viewer",
      winnerAvatar: item.winner_profile_image_url || undefined,
      time: formatTime(item.created_at),
      trigger: getEventLabel(item.event_key),
      deadline: formatTime(item.trade_offer_expiry_at),
      price: item.skin_price ? String(item.skin_price) : "0.00",
      status: item.delivery_status === "success" ? "received" : item.delivery_status === "sent" ? "sent" : item.delivery_status === "not_claimed" || item.delivery_status === "failed" ? "missed" : "processing",
      game: "dota",
    })) as PrizeData[];

    if (mapped.length === 0 && SHOW_FAKE_STREAMER) {
      return [
        {
          id: "demo-1",
          streamerName: twitchLogin || streamTitle,
          winnerNick: "viewer_one",
          time: "26.01 17:34",
          trigger: "Double Kill",
          deadline: "26.01 17:49",
          price: "0.12",
          status: "processing",
          game: "dota",
        },
        {
          id: "demo-2",
          streamerName: twitchLogin || streamTitle,
          winnerNick: "viewer_two",
          time: "26.01 17:12",
          trigger: "Triple Kill",
          deadline: "26.01 17:27",
          price: "0.15",
          status: "sent",
          game: "dota",
        },
        {
          id: "demo-3",
          streamerName: twitchLogin || streamTitle,
          winnerNick: "viewer_three",
          time: "26.01 16:48",
          trigger: "Rampage",
          deadline: "26.01 17:03",
          price: "0.25",
          status: "received",
          game: "dota",
        },
      ];
    }

    return mapped;
  }, [profile, twitchLogin, streamTitle]);

  const openLink = (url?: string | null) => {
    if (!url) return;
    const tg = (window as any)?.Telegram?.WebApp;
    if (tg?.openLink) tg.openLink(url);
    else window.open(url, "_blank");
  };

  const handleFollowToggle = async () => {
    if (!streamerId || !twitchLogin) return;
    try {
      await ensureAuth();
      if (isFollowed) {
        await apiDelete(`/viewer/tracked/${streamerId}`);
        setIsFollowed(false);
      } else {
        await apiPost("/viewer/tracked", { twitch_login: twitchLogin });
        setIsFollowed(true);
      }
    } catch (e) {
      console.error("Failed to toggle follow:", e);
    }
  };

  const conditions = [
    { id: "chat", name: "Хотя бы одно сообщение в чате стримера за последние {N} мин", completed: Boolean(eligibility?.chat_recent) },
    { id: "follow", name: "Подписка на канал", completed: Boolean(eligibility?.is_follower) },
    { id: "twitch", name: "Twitch привязан", completed: Boolean(eligibility?.has_twitch) },
    { id: "steam", name: "Steam привязан", completed: Boolean(eligibility?.has_steam) },
    { id: "tracked", name: "Отслеживание стримера в StreamersDrop mini app", completed: Boolean(eligibility?.is_tracked) },
  ];
  const allConditionsMet = conditions.every((c) => c.completed);

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => router.back()}
          className="w-8 h-8 rounded-[8px] bg-white/5 border border-white/10 flex items-center justify-center"
          aria-label="Назад"
        >
          <img src={leftArrowIcon} alt="" className="w-5 h-5" aria-hidden="true" />
        </button>
        <div className="flex items-center gap-2 flex-1">
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={() => openLink(profile?.streamer?.telegram_channel_url)}
              className="px-3 py-2 rounded-[14px] border border-white/10 text-[12px] font-semibold text-white"
              style={{ background: "#229ED9" }}
            >
              TG
            </button>
            <button
              type="button"
              onClick={() => openLink(twitchLogin ? `https://twitch.tv/${twitchLogin}` : undefined)}
              className="px-3 py-2 rounded-[14px] border border-white/10 text-[12px] font-semibold text-white"
              style={{ background: "#9146FF" }}
            >
              TWITCH
            </button>
            <button
              type="button"
              onClick={handleFollowToggle}
              className={`w-10 h-10 rounded-[14px] flex items-center justify-center ${
                isFollowed ? "bg-[#5B4BFF]/35" : "bg-[#5B4BFF]/20"
              }`}
              aria-label={isFollowed ? "Unfollow" : "Follow"}
            >
              <img
                src={isFollowed ? deleteUserIcon : addUserIcon}
                alt=""
                className="w-6 h-6"
                aria-hidden="true"
              />
            </button>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative overflow-visible">
          <img
            src={avatarCircle}
            alt=""
            className="pointer-events-none absolute left-1/2 top-1/2 object-contain z-30"
            style={{
              width: 260,
              height: 260,
              transform: "translate(-50%, -50%) scale(1.42)",
            }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#9146FF] to-[#5B4BFF] rounded-full blur-md opacity-60"></div>
          <div className="relative w-20 h-20 rounded-full border border-white/40 overflow-hidden bg-gradient-to-br from-[#101426] to-[#1a2140] flex items-center justify-center">
            <img src={avatarSrc} alt={streamTitle} className="w-full h-full object-cover" />
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">{streamTitle}</h2>
          {profile?.live?.is_live && (
            <div className="flex items-center gap-2 mt-1">
              <img src={liveIcon} alt="Live" className="w-11 h-11" />
              <img src={eyeIcon} alt="" className="w-6 h-6 -ml-1" aria-hidden="true" />
              <span className="text-sm font-semibold text-[#ff4b4b]">{liveViewers}</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="yuze-glass rounded-[20px] px-4 py-2 text-center">
          <img src={unicIcon} alt="" className="w-7 h-7 mx-auto mb-2" aria-hidden="true" />
          <p className="text-sm font-['Space_Grotesk'] text-white/85 mb-1">Уник. участники</p>
          <p className="text-xl font-['Space_Grotesk'] font-bold text-white">{participants}</p>
        </div>
        <div className="yuze-glass rounded-[20px] px-4 py-2 text-center">
          <img src={dollarSignIcon} alt="" className="w-7 h-7 mx-auto mb-2" aria-hidden="true" />
          <p className="text-sm font-['Space_Grotesk'] text-white/85 mb-1">Общая стоимость</p>
          <p className="text-xl font-['Space_Grotesk'] font-bold text-[#00FF9D]">{totalAmountLabel}</p>
        </div>
        <div className="yuze-glass rounded-[20px] px-4 py-2 text-center">
          <img src={trophyIcon} alt="" className="w-7 h-7 mx-auto mb-2" aria-hidden="true" />
          <p className="text-sm font-['Space_Grotesk'] text-white/85 mb-1">Уник. победители</p>
          <p className="text-xl font-['Space_Grotesk'] font-bold text-white">{uniqueWinners}</p>
        </div>
        <div className="yuze-glass rounded-[20px] px-4 py-2 text-center">
          <img src={customerExperienceIcon} alt="" className="w-8 h-8 mx-auto mb-2" aria-hidden="true" />
          <p className="text-sm font-['Space_Grotesk'] text-white/85 -mt-2 mb-1">Сейчас участвуют</p>
          <p className="text-xl font-['Space_Grotesk'] font-bold text-white">{streamParticipants}</p>
        </div>
      </div>

      {!allConditionsMet && (
        <div
          className="bg-red-500/10 border border-red-500/30 rounded-[20px] px-4 py-2 flex items-start gap-3"
          style={{
            boxShadow: "0 4px 16px rgba(239, 68, 68, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)",
          }}
        >
          <img src={checklistIcon} alt="" className="w-7 h-7 text-red-500 flex-shrink-0 mt-2" aria-hidden="true" />
          <div>
            <p className="text-white font-['Space_Grotesk'] font-semibold text-base">Вы не выполнили все условия</p>
            <p className="text-red-300 font-['Space_Grotesk'] text-sm mt-0">Подробности во вкладке Условия</p>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("stats")}
          className={`flex-1 py-3 px-4 rounded-[16px] font-semibold transition-all duration-300 ${
            activeTab === "stats" ? "bg-[#5B4BFF] text-white" : "bg-white/5 text-[#b3b3ff]"
          }`}
        >
          Статистика
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("events")}
          className={`flex-1 py-3 px-4 rounded-[16px] font-semibold transition-all duration-300 ${
            activeTab === "events" ? "bg-[#5B4BFF] text-white" : "bg-white/5 text-[#b3b3ff]"
          }`}
        >
          События
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("conditions")}
          className={`flex-1 py-3 px-4 rounded-[16px] font-semibold transition-all duration-300 ${
            activeTab === "conditions" ? "bg-[#5B4BFF] text-white" : "bg-white/5 text-[#b3b3ff]"
          }`}
        >
          <span className="inline-flex items-center justify-center w-full gap-2">
            <img
              src={allConditionsMet ? insuranceIcon : termsIcon}
              alt=""
              className="w-6 h-6"
              aria-hidden="true"
            />
            Условия
          </span>
        </button>
      </div>

      {activeTab === "stats" && (
        <div className="space-y-3">
          {recentPrizes.length === 0 ? (
            <div className="yuze-glass rounded-[14px] px-4 py-6 text-center text-[#b3b3ff]">
              Призы пока не выдавались.
            </div>
          ) : (
            recentPrizes.map((prize) => <PrizeCard key={prize.id} prize={prize} />)
          )}
        </div>
      )}

      {activeTab === "events" && (
        <div className="space-y-2">
          {events.length === 0 ? (
            <div className="yuze-glass rounded-[12px] px-4 py-3 text-[#b3b3ff]">
              События пока не настроены.
            </div>
          ) : (
            events.map((event) => (
              <div key={event.id} className="yuze-glass rounded-[12px] px-4 py-3 flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-white font-['Space_Grotesk'] font-semibold">{event.name}</h4>
                </div>
                {event.isActive ? (
                  <img src={checkIcon} alt="" className="w-5 h-5" aria-hidden="true" />
                ) : (
                  <img src={closeIcon} alt="" className="w-5 h-5" aria-hidden="true" />
                )}
              </div>
            ))
          )}
        </div>
      )}

      {activeTab === "conditions" && (
        <div className="space-y-3">
          <div className="yuze-glass-soft rounded-[14px] px-4 py-3 flex items-center gap-3">
            <img src={allConditionsMet ? insuranceIcon : checklistIcon} alt="" className="w-8 h-8" />
            <p className="text-white font-semibold">
              {allConditionsMet ? "Все условия выполнены" : "Условия участия"}
            </p>
            <img src={termsIcon} alt="" className="w-5 h-5 ml-auto" />
          </div>
          {conditions.map((condition) => (
            <div key={condition.id} className="yuze-glass rounded-[14px] px-4 py-3 flex items-center gap-3">
              <img src={condition.completed ? checkIcon : closeIcon} alt="" className="w-5 h-5" />
              <p className="text-white text-sm">{condition.name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
