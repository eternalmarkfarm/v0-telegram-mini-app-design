"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Users, TrendingUp } from "lucide-react";
import PrizeCard, { PrizeData } from "@/app/prom/components/PrizeCard";
import { apiDelete, apiGet, apiPost } from "@/lib/api";
import { ensureAuth } from "@/lib/ensureAuth";
import { getEventLabel } from "@/lib/event-labels";

const leftArrowIcon = "/prom/left-arrow.png";
const avatarCircle = "/prom/circle.png";
const addUserIcon = "/prom/add-user.png";
const deleteUserIcon = "/prom/delete-user.png";
const liveIcon = "/prom/live_2.png";
const eyeIcon = "/prom/eye1.png";
const rewardIcon = "/prom/medal_new.png";
const trophyIcon = "/prom/trophy.png";
const unicIcon = "/prom/unic.png";
const dollarSignIcon = "/prom/dollar-sign.png";
const customerExperienceIcon = "/prom/customer-experience.png";
const checklistIcon = "/prom/checklist.png";
const termsIcon = "/prom/terms-and-conditions.png";
const insuranceIcon = "/prom/insurance.png";
const checkIcon = "/prom/check.png";
const closeIcon = "/prom/close.png";

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
  const [profile, setProfile] = useState<StreamerProfile | null>(null);
  const [eligibility, setEligibility] = useState<Eligibility | null>(null);
  const [isFollowed, setIsFollowed] = useState(false);

  useEffect(() => {
    if (!streamerId) return;
    const load = async () => {
      try {
        const res = await apiGet(`/streamers/${streamerId}`);
        setProfile(res);
      } catch (e) {
        console.error("Failed to load streamer profile:", e);
        setProfile(null);
      }
    };
    load();
  }, [streamerId]);

  useEffect(() => {
    if (!streamerId) return;
    const load = async () => {
      try {
        await ensureAuth();
        const res = await apiGet(`/viewer/eligibility?streamer_id=${streamerId}`);
        setEligibility(res);
        setIsFollowed(Boolean(res?.is_tracked));
      } catch (e) {
        console.error("Failed to load eligibility:", e);
      }
    };
    load();
  }, [streamerId]);

  const streamTitle = profile?.streamer?.twitch_display_name || profile?.streamer?.display_name || profile?.streamer?.twitch_login || "Streamer";
  const avatarSrc = profile?.streamer?.profile_image_url || "/prom/twitch_avatar.webp";
  const twitchLogin = profile?.streamer?.twitch_login;
  const liveViewers = profile?.live?.viewer_count ?? 0;
  const participants = profile?.stats?.stream_participants ?? 0;

  const recentPrizes = useMemo(() => {
    return (profile?.recent_prizes ?? []).map((item: any) => ({
      id: String(item.id),
      streamerName: twitchLogin || streamTitle,
      winnerNick: item.twitch_login || "viewer",
      time: formatTime(item.created_at),
      trigger: getEventLabel(item.event_key),
      deadline: formatTime(item.trade_offer_expiry_at),
      price: item.skin_price ? String(item.skin_price) : "0.00",
      status: item.delivery_status === "success" ? "received" : item.delivery_status === "sent" ? "sent" : item.delivery_status === "not_claimed" || item.delivery_status === "failed" ? "missed" : "processing",
      game: "dota",
    })) as PrizeData[];
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
              width: 200,
              height: 200,
              transform: "translate(-50%, -50%) scale(1.2)",
            }}
            aria-hidden="true"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#9146FF] to-[#5B4BFF] rounded-full blur-md opacity-70"></div>
          <div className="relative z-10 w-20 h-20 rounded-full border border-white/40 overflow-hidden bg-gradient-to-br from-[#101426] to-[#1a2140] flex items-center justify-center shadow-[0_0_24px_rgba(145,70,255,0.35)]">
            <img src={avatarSrc} alt={streamTitle} className="w-full h-full object-cover" />
          </div>
        </div>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white drop-shadow-[0_0_12px_rgba(255,255,255,0.3)]">
            {streamTitle}
          </h1>
          {profile?.live?.is_live && (
            <div className="flex items-center gap-2 mt-2">
              <img src={liveIcon} alt="" className="w-6 h-6" aria-hidden="true" />
              <span className="text-white font-semibold">LIVE</span>
              <img src={eyeIcon} alt="" className="w-4 h-4" aria-hidden="true" />
              <span className="text-white/80">{liveViewers}</span>
            </div>
          )}
        </div>
      </div>

      <div className="yuze-glass rounded-[16px] px-4 py-4">
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="rounded-[14px] bg-white/5 px-3 py-3">
            <img src={unicIcon} alt="" className="w-6 h-6 mx-auto mb-2" />
            <p className="text-white text-lg font-semibold">{participants}</p>
            <p className="text-[#b3b3ff] text-xs">Сейчас участвуют</p>
          </div>
          <div className="rounded-[14px] bg-white/5 px-3 py-3">
            <img src={trophyIcon} alt="" className="w-6 h-6 mx-auto mb-2" />
            <p className="text-white text-lg font-semibold">{profile?.stats?.total_prizes ?? 0}</p>
            <p className="text-[#b3b3ff] text-xs">Уникальные победители</p>
          </div>
          <div className="rounded-[14px] bg-white/5 px-3 py-3">
            <img src={dollarSignIcon} alt="" className="w-6 h-6 mx-auto mb-2" />
            <p className="text-white text-lg font-semibold">{profile?.stats?.total_amount ?? 0}</p>
            <p className="text-[#b3b3ff] text-xs">Общая сумма</p>
          </div>
          <div className="rounded-[14px] bg-white/5 px-3 py-3">
            <img src={customerExperienceIcon} alt="" className="w-6 h-6 mx-auto mb-2" />
            <p className="text-white text-lg font-semibold">{profile?.stats?.stream_prizes ?? 0}</p>
            <p className="text-[#b3b3ff] text-xs">В розыгрыше</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("stats")}
          className={`text-sm font-semibold transition-all ${activeTab === "stats" ? "text-white" : "text-[#b3b3ff]"}`}
        >
          Призы
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("conditions")}
          className={`text-sm font-semibold transition-all ${activeTab === "conditions" ? "text-white" : "text-[#b3b3ff]"}`}
        >
          Условия
        </button>
      </div>

      {activeTab === "conditions" ? (
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
      ) : (
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
    </div>
  );
}
