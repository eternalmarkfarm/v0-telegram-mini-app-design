"use client";

import { useEffect, useState } from 'react';
import Link from "next/link";
import { ChevronDown, Download, Trash2 } from 'lucide-react';
import { useStreamerMe } from "@/app/prom/lib/useStreamerMe";
import { apiGet, apiPost, getToken } from "@/lib/api";
const softwareIcon = "/prom/block.svg";
const fireIcon = "/prom/fire.svg";
const statisticsIcon = "/prom/statistics.svg";
const cs2Icon = "/prom/cs2.png";
const dotaIcon = "/prom/icons8-dota-2-64.png";
const fastDeliveryIcon = "/prom/fast-delivery.svg";
const trophyIcon = "/prom/trophy.svg";


export default function StreamPanel() {
  const [isGsiOpen, setIsGsiOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { data, loading } = useStreamerMe();
  const [chatMinutes, setChatMinutes] = useState("60");
  const [chatSaving, setChatSaving] = useState(false);
  const [chatSaved, setChatSaved] = useState(false);

  useEffect(() => {
    if (typeof data?.streamer?.chat_recent_minutes === "number") {
      setChatMinutes(String(data.streamer.chat_recent_minutes));
    }
  }, [data?.streamer?.chat_recent_minutes]);

  const handleConfigDownload = async () => {
    try {
      if (!getToken()) throw new Error("Missing token");
      const res = await apiGet("/streamer/gsi-installer-link");
      if (!res?.url) throw new Error("No download url");
      const url = res.url as string;
      // Telegram WebView can block blob downloads, so open the direct URL.
      const tg = (window as any)?.Telegram?.WebApp;
      if (tg?.openLink) {
        tg.openLink(url);
        return;
      }
      const a = document.createElement("a");
      a.href = url;
      a.target = "_blank";
      a.rel = "noopener";
      a.click();
    } catch (e) {
      console.error("Failed to download GSI installer:", e);
    }
  };

  const handleDeletePanel = () => {
    if (confirm('Вы уверены, что хотите удалить кабинет стримера?')) {
      console.log('Deleting panel...');
    }
  };

  const handleChatMinutesSave = async () => {
    try {
      setChatSaving(true);
      setChatSaved(false);
      const minutes = Math.max(1, Math.min(Number(chatMinutes) || 60, 1440));
      const res = await apiPost("/streamer/chat-settings", { chat_recent_minutes: minutes });
      if (typeof res?.chat_recent_minutes === "number") {
        setChatMinutes(String(res.chat_recent_minutes));
      }
      setChatSaved(true);
    } catch (e) {
      console.error("Failed to save chat minutes:", e);
    } finally {
      setChatSaving(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-6 font-['Space_Grotesk'] text-[17px]">
      <h1 className="text-2xl font-bold text-white drop-shadow-[0_0_12px_rgba(91,75,255,0.4)]">
        Stream Panel
      </h1>

      {!loading && !data?.streamer && (
        <div className="yuze-glass rounded-[20px] p-4 text-[#b3b3ff]">
          <p className="text-white font-semibold mb-2">Кабинет стримера не создан</p>
          <Link
            href="/begin-streamer"
            className="inline-flex items-center justify-center rounded-[14px] bg-[#5B4BFF] px-4 py-2 text-white font-semibold"
          >
            Создать кабинет
          </Link>
        </div>
      )}

      <Link
        href="/streamer-integrations"
        className="block yuze-glass-soft rounded-[20px] p-3 hover:bg-white/[0.12] transition-all duration-300"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center">
            <img src={softwareIcon} alt="" className="w-11 h-11" aria-hidden="true" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="text-lg font-bold text-white">Интеграция сторонних сервисов</h3>
            <p className="text-sm text-[#b3b3ff] mt-1">StreamElement, TG канал, Lis-Skins</p>
          </div>
        </div>
      </Link>

      <Link
        href="/streamer-events"
        className="block yuze-glass-soft rounded-[20px] p-3 hover:bg-white/[0.12] transition-all duration-300"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center">
            <img src={fireIcon} alt="" className="w-9 h-9" aria-hidden="true" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="text-lg font-bold text-white">Настройка событий</h3>
          </div>
        </div>
      </Link>

      <Link
        href="/streamer-stats"
        className="block yuze-glass-soft rounded-[20px] p-3 hover:bg-white/[0.12] transition-all duration-300"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center">
            <img src={statisticsIcon} alt="" className="w-9 h-9" aria-hidden="true" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="text-lg font-bold text-white">Статистика</h3>
          </div>
        </div>
      </Link>

      <div className="yuze-glass rounded-[20px] p-4">
        <button
          type="button"
          onClick={() => setIsGsiOpen((prev) => !prev)}
          className="w-full flex items-center gap-3 text-left"
          aria-expanded={isGsiOpen}
        >
          <img src={fastDeliveryIcon} alt="" className="w-9 h-9" aria-hidden="true" />
          <div className="flex-1">
            <h3 className="text-base font-bold text-white">Скачать конфиг GSI</h3>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-[#b3b3ff] transition-transform ${
              isGsiOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        <div
          className={`transition-all duration-300 ${
            isGsiOpen ? 'mt-3 max-h-40 opacity-100' : 'mt-0 max-h-0 opacity-0'
          } overflow-hidden`}
        >
          <div className="grid grid-cols-2 gap-0">
          <div className="flex items-center gap-3 pr-3">
            <div className="w-9 h-9 rounded-[10px] bg-white/5 flex items-center justify-center">
              <img src={cs2Icon} alt="" className="w-6 h-6" aria-hidden="true" />
            </div>
            <div className="flex-1 flex items-center justify-between">
              <p className="text-sm text-[#b3b3ff]">CS2</p>
              <button
                onClick={handleConfigDownload}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition"
                aria-label="Скачать конфиг CS2"
              >
                <Download className="w-4 h-4 text-white/90" />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 pl-3 border-l border-white/10">
            <div className="w-9 h-9 rounded-[10px] bg-white/5 flex items-center justify-center">
              <img src={dotaIcon} alt="" className="w-6 h-6" aria-hidden="true" />
            </div>
            <div className="flex-1 flex items-center justify-between">
              <p className="text-sm text-[#b3b3ff]">Dota 2</p>
              <button
                onClick={handleConfigDownload}
                className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition"
                aria-label="Скачать конфиг Dota 2"
              >
                <Download className="w-4 h-4 text-white/90" />
              </button>
            </div>
          </div>
        </div>
        </div>
      </div>

      <Link
        href="/superdrop-settings"
        className="block yuze-glass rounded-[24px] p-6 hover:bg-white/[0.14] transition-all duration-300"
      >
        <div className="flex items-center gap-4">
          <img src={trophyIcon} alt="" className="w-8 h-8" aria-hidden="true" />
          <div className="flex-1 text-left">
            <h3 className="text-lg font-bold text-white">Настройки SuperDrop</h3>
            <p className="text-sm text-[#b3b3ff] mt-1">Управление дропами и правилами</p>
          </div>
        </div>
      </Link>

      <div className="yuze-glass rounded-[24px] p-6">
        <button
          type="button"
          onClick={() => setIsChatOpen((prev) => !prev)}
          className="w-full flex items-center gap-3 text-left"
          aria-expanded={isChatOpen}
        >
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white">Период активности чата</h3>
            <p className="text-sm text-[#b3b3ff] mt-1">
              Зритель считается активным, если писал в чат за последние N минут.
            </p>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-[#b3b3ff] transition-transform ${isChatOpen ? 'rotate-180' : ''}`}
          />
        </button>

        <div
          className={`transition-all duration-300 ${
            isChatOpen ? 'mt-4 max-h-40 opacity-100' : 'mt-0 max-h-0 opacity-0'
          } overflow-hidden`}
        >
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              max={1440}
              value={chatMinutes}
              onChange={(e) => setChatMinutes(e.target.value)}
              className="no-number-spin flex-1 h-10 rounded-[12px] border border-white/10 bg-white/5 px-3 text-sm text-white focus:outline-none focus:border-[#5B4BFF] transition-colors"
            />
            <span className="text-sm text-[#b3b3ff]">мин</span>
            <button
              onClick={handleChatMinutesSave}
              className="h-9 px-4 rounded-[12px] bg-white/10 text-sm text-white hover:bg-white/20 transition"
              disabled={chatSaving}
            >
              {chatSaving ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
          <div className="mt-2 text-xs text-[#7aa7ff]">{chatSaved ? "Сохранено" : ""}</div>
        </div>
      </div>

      <button
        onClick={handleDeletePanel}
        className="w-full bg-red-500/10 border border-red-500/30 rounded-[24px] p-6 hover:bg-red-500/20 transition-all duration-300"
        style={{
          boxShadow: '0 4px 16px rgba(239, 68, 68, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)',
        }}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-red-500/20 rounded-[16px] flex items-center justify-center">
            <Trash2 className="w-6 h-6 text-red-500" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="text-lg font-bold text-red-500">Удалить кабинет стримера</h3>
            <p className="text-sm text-red-300 mt-1">Это действие необратимо</p>
          </div>
        </div>
      </button>
    </div>
  );
}
