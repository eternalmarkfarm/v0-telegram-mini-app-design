"use client";

import { useEffect, useState } from "react";
import { useRouter } from 'next/navigation';
import { Video, TrendingUp } from 'lucide-react';
import { apiGet, apiPost } from "@/lib/api";
import { ensureAuth } from "@/lib/ensureAuth";
const trophyIcon = "/prom/trophy.svg";
const fireIcon = "/prom/fire.svg";
const statisticsIcon = "/prom/statistics.svg";


export default function BeginStreamer() {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [isAndroid, setIsAndroid] = useState(false);
  const [androidAuthUrl, setAndroidAuthUrl] = useState<string | null>(null);
  const [androidAuthLoading, setAndroidAuthLoading] = useState(false);
  const [androidAuthError, setAndroidAuthError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const ua = navigator.userAgent || "";
    const platform = (window as any)?.Telegram?.WebApp?.platform;
    setIsAndroid(platform === "android" || /Android/i.test(ua));
  }, []);

  // no auto-prefetch on Android; user explicitly requests link

  const handleAndroidAuth = async () => {
    if (androidAuthLoading) return;
    setAndroidAuthLoading(true);
    setAndroidAuthError(null);
    try {
      await ensureAuth();
      const response = await apiGet("/twitch/authorize-streamer-link");
      const url =
        response?.short_url ||
        response?.shortUrl ||
        response?.short_link ||
        response?.shortLink ||
        response?.android_url ||
        response?.auth_url ||
        response?.authUrl ||
        response?.url;
      if (url) {
        setAndroidAuthUrl(url);
      } else {
        setAndroidAuthError("Не удалось получить ссылку");
      }
    } catch (e) {
      console.error("Android Twitch link error:", e);
      setAndroidAuthError("Не удалось получить ссылку");
    } finally {
      setAndroidAuthLoading(false);
    }
  };

  const handleCreatePanel = async () => {
    setIsCreating(true);
    try {
      await ensureAuth();
      const me = await apiGet("/me").catch(() => null);
      const displayName = me?.first_name || me?.username || "Streamer";
      await apiPost("/streamer/me", { display_name: displayName });
      router.push("/prom/stream-panel");
    } catch (e) {
      console.error("Failed to create streamer:", e);
    } finally {
      setIsCreating(false);
    }
  };

  const features: Array<{
    title: string;
    description: string;
    icon?: React.ComponentType<{ className?: string }>;
    image?: string;
  }> = [
    {
      image: trophyIcon,
      title: 'Автоматические розыгрыши на стриме',
      description: 'Настройте автоматические раздачи призов во время игры',
    },
    {
      image: fireIcon,
      title: 'Настройка событий для розыгрышей',
      description: 'Создавайте события на базе игровых достижений',
    },
    {
      image: statisticsIcon,
      title: 'Статистика и история отправок',
      description: 'Отслеживайте все раздачи и их статистику',
    },
  ];

  return (
    <div className="max-w-md mx-auto px-4 py-8 font-['Space_Grotesk'] text-[17px]">
      <div className="text-center mb-8">
        <div className="relative inline-block mb-6">
          <div className="absolute inset-0 bg-[#9146FF] opacity-30 blur-3xl rounded-full"></div>
          <div className="relative w-24 h-24 mx-auto bg-gradient-to-br from-[#4b7bff]/35 to-[#2f4ed8]/35 rounded-[28px] flex items-center justify-center border border-white/20">
            <Video className="w-12 h-12 text-[#4b7bff] drop-shadow-[0_0_16px_rgba(75,123,255,0.6)]" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-white mb-3 drop-shadow-[0_0_16px_rgba(91,75,255,0.4)]">
          Станьте стримером
        </h1>
        <p className="text-[#b3b3ff] text-base">
          Привяжите Twitch аккаунт, чтобы получить доступ к личному кабинету стримера
        </p>
      </div>

      <div className="yuze-glass rounded-[28px] p-4 mb-6">
        <div className="flex items-center gap-3 mb-4 justify-center text-center">
          <div>
            <h3 className="text-white font-bold text-lg mb-1 inline-flex items-center gap-2">
              Подключить Twitch
              <svg className="text-[#9146FF]" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
              </svg>
            </h3>
            <p className="text-[#b3b3ff] text-sm">Необходимо для доступа к панели</p>
          </div>
        </div>

        {isAndroid && (
          <div className="mb-4 rounded-[14px] border border-[#5B4BFF]/40 bg-[#1a1f3a]/70 px-3 py-2 text-xs text-[#b3b3ff]">
            <p className="font-semibold text-white mb-1">Android: ссылка для авторизации</p>
            <p className="mb-2">
              Откройте ссылку ниже в браузере (это рабочий вариант для Android).
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleAndroidAuth}
                className="flex-1 rounded-[12px] bg-[#3b6bff] py-2 text-white font-semibold shadow-[0_4px_18px_rgba(59,107,255,0.45)]"
              >
                {androidAuthLoading ? "Получаем..." : "Получить ссылку"}
              </button>
              <button
                type="button"
                onClick={() => {
                  if (androidAuthUrl) navigator.clipboard?.writeText(androidAuthUrl);
                }}
                className="rounded-[12px] px-3 py-2 text-white/90 bg-white/10"
              >
                Копировать
              </button>
            </div>
            <input
              className="mt-2 w-full rounded-[8px] bg-[#12162a] border border-white/10 px-2 py-1 text-[11px] text-white/80"
              value={androidAuthUrl ?? ""}
              readOnly
              placeholder={androidAuthLoading ? "Ссылка подгружается..." : (androidAuthError ?? "Нажмите “Получить ссылку”")}
              onFocus={(e) => e.currentTarget.select()}
            />
          </div>
        )}

        <button
          onClick={handleCreatePanel}
          disabled={isCreating}
          className="w-full bg-gradient-to-br from-[#3b6bff] to-[#2f4ed8] rounded-[20px] px-6 py-4 text-white font-bold text-lg hover:from-[#4a79ff] hover:to-[#365be3] transition-all duration-300 shadow-[0_4px_24px_rgba(59,107,255,0.45)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isCreating ? (
            <>
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Создаём панель...</span>
            </>
          ) : (
            <>
              <Video className="w-5 h-5" />
              <span>Стать стримером</span>
            </>
          )}
        </button>
      </div>

      <div className="space-y-2">
        {features.map((feature, index) => {
          const Icon = feature.icon;
          return (
            <div key={index} className="yuze-glass-soft rounded-[20px] p-3 flex items-start gap-4">
              <div className="w-12 h-12 rounded-[16px] bg-[#5B4BFF]/20 flex items-center justify-center flex-shrink-0">
                {feature.image ? (
                  <img src={feature.image} alt="" className="w-6 h-6" aria-hidden="true" />
                ) : (
                  Icon && <Icon className="w-6 h-6 text-[#5B4BFF]" />
                )}
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1">{feature.title}</h4>
                <p className="text-[#b3b3ff] text-sm leading-relaxed">{feature.description}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
