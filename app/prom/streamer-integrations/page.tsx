"use client";

import { useEffect, useState } from 'react';
import { useRouter } from "next/navigation";
import { ChevronDown } from 'lucide-react';
import { apiGet, apiPost } from "@/lib/api";
import { ensureAuth } from "@/lib/ensureAuth";
const leftArrowIcon = "/prom/left-arrow.svg";
const flyIcon = "/prom/fly.svg";
const steamIcon = "/prom/icons8-steam-94.png";
const infoIcon = "/prom/info_notice.svg";
const keyIcon = "/prom/key.svg";
const unlockIcon = "/prom/unlock.svg";
const lockKeyIcon = "/prom/lock_key.svg";
const medalNewIcon = "/prom/medal_new.svg";


export default function StreamerIntegrations() {
  const router = useRouter();
  const [channelId, setChannelId] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [telegramChannel, setTelegramChannel] = useState('');
  const [gsiStatus, setGsiStatus] = useState<'unchecked' | 'connected' | 'error'>('unchecked');
  const [telegramSaved, setTelegramSaved] = useState(false);
  const [isStreamElementOpen, setIsStreamElementOpen] = useState(false);
  const [streamElementSaved, setStreamElementSaved] = useState(false);
  const [isLisSkinsOpen, setIsLisSkinsOpen] = useState(false);
  const [lisSkinsToken, setLisSkinsToken] = useState('');
  const [lisSkinsSaved, setLisSkinsSaved] = useState(false);
  const [lisSkinsTradeLink, setLisSkinsTradeLink] = useState('');
  const [lisSkinsPrice, setLisSkinsPrice] = useState('');
  const [lisSkinsGame, setLisSkinsGame] = useState<'cs2' | 'dota2'>('cs2');
  const [lisSkinsSending, setLisSkinsSending] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        await ensureAuth();
        const [streamer, se, tg, gsi, trade] = await Promise.all([
          apiGet("/streamer/me").catch(() => null),
          apiGet("/streamer/streamelements").catch(() => null),
          apiGet("/streamer/telegram-channel").catch(() => null),
          apiGet("/streamer/gsi-status").catch(() => null),
          apiGet("/streamer/lis-skins-trade-url").catch(() => null),
        ]);
        if (se?.channel_id) setChannelId(se.channel_id);
        setStreamElementSaved(Boolean(se?.token_set || se?.channel_id));
        if (tg?.telegram_channel_url) setTelegramChannel(tg.telegram_channel_url);
        setTelegramSaved(Boolean(tg?.telegram_channel_url));
        if (streamer?.streamer?.lis_skins_token_set) setLisSkinsSaved(true);
        if (trade?.trade_url) setLisSkinsTradeLink(trade.trade_url);
        const seconds = gsi?.seconds_ago;
        if (typeof seconds === "number") {
          setGsiStatus(seconds <= 180 ? "connected" : "error");
        }
      } catch (e) {
        console.error("Failed to load integrations:", e);
      }
    };
    load();
  }, []);

  const handleStreamElementSave = async () => {
    if (!channelId.trim() && !apiToken.trim()) return;
    try {
      await ensureAuth();
      await apiPost("/streamer/streamelements", {
        channel_id: channelId.trim(),
        api_token: apiToken.trim(),
      });
      setStreamElementSaved(true);
      setTimeout(() => setStreamElementSaved(false), 2000);
    } catch (e) {
      console.error("StreamElements save error:", e);
    }
  };

  const handleStreamElementReset = async () => {
    try {
      await ensureAuth();
      await apiPost("/streamer/streamelements/clear", {});
      setChannelId('');
      setApiToken('');
      setStreamElementSaved(false);
    } catch (e) {
      console.error("StreamElements clear error:", e);
    }
  };

  const handleStreamElementTest = async () => {
    try {
      await ensureAuth();
      await apiPost("/streamer/streamelements/test", {});
    } catch (e) {
      console.error("StreamElements test error:", e);
    }
  };

  const handleGsiCheck = async () => {
    try {
      await ensureAuth();
      const res = await apiGet("/streamer/gsi-status");
      const seconds = res?.seconds_ago;
      if (typeof seconds === "number") {
        setGsiStatus(seconds <= 180 ? "connected" : "error");
      } else {
        setGsiStatus("error");
      }
    } catch (e) {
      console.error("GSI status error:", e);
      setGsiStatus("error");
    }
  };

  const handleTelegramSave = async () => {
    try {
      await ensureAuth();
      await apiPost("/streamer/telegram-channel", { telegram_channel_url: telegramChannel.trim() });
      setTelegramSaved(true);
      window.setTimeout(() => setTelegramSaved(false), 2000);
    } catch (e) {
      console.error("Telegram channel save error:", e);
    }
  };

  const handleLisSkinsSave = async () => {
    if (!lisSkinsToken.trim()) return;
    try {
      await ensureAuth();
      await apiPost("/streamer/lis-skins-token", { api_token: lisSkinsToken.trim() });
      setLisSkinsSaved(true);
    } catch (e) {
      console.error("Lis-Skins token save error:", e);
    }
  };

  const handleLisSkinsSend = async () => {
    if (!lisSkinsTradeLink.trim()) return;
    const priceVal = Number(lisSkinsPrice);
    setLisSkinsSending(true);
    try {
      await ensureAuth();
      await apiPost("/streamer/lis-skins/test-purchase", {
        trade_url: lisSkinsTradeLink.trim(),
        price_min: Number.isFinite(priceVal) ? priceVal : undefined,
        price_max: Number.isFinite(priceVal) ? priceVal : undefined,
      });
    } catch (e) {
      console.error("Lis-Skins manual send error:", e);
    } finally {
      setLisSkinsSending(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-4 font-['Space_Grotesk'] text-[17px]">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="w-8 h-8 rounded-[8px] bg-white/5 border border-white/10 flex items-center justify-center"
          aria-label="Назад"
        >
          <img src={leftArrowIcon} alt="" className="w-5 h-5" aria-hidden="true" />
        </button>
        <h1 className="text-white font-bold text-lg">Интеграция сервисов</h1>
      </div>

      <div className="yuze-glass-soft rounded-[20px] p-6">
        <button
          type="button"
          onClick={() => setIsLisSkinsOpen((prev) => !prev)}
          className="flex w-full items-center justify-between text-left"
          aria-expanded={isLisSkinsOpen}
        >
          <div className="flex items-center gap-3">
            <img src={medalNewIcon} alt="" className="w-6 h-6" aria-hidden="true" />
            <h3 className="text-lg font-bold text-white">Настройка Lis-Skins</h3>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-[#b3b3ff] transition-transform ${
              isLisSkinsOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        <div className={`mt-4 space-y-3 ${isLisSkinsOpen ? 'block' : 'hidden'}`}>
          <div className="space-y-2">
            <p className="text-sm text-[#b3b3ff] font-semibold">API ТОКЕН Lis-Skins</p>
            <div className="relative">
              <input
                type="text"
                value={lisSkinsToken}
                onChange={(e) => {
                  setLisSkinsToken(e.target.value);
                  setLisSkinsSaved(false);
                }}
                placeholder="Введите API токен"
                className="w-full bg-white/5 border border-white/10 rounded-[16px] pl-4 pr-11 py-3 text-white placeholder:text-[#b3b3ff]/70 focus:outline-none focus:border-[#5B4BFF] transition-colors"
              />
              <img
                src={lisSkinsSaved && lisSkinsToken.trim() ? lockKeyIcon : unlockIcon}
                alt=""
                className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 opacity-80"
                aria-hidden="true"
              />
            </div>
            <button
              onClick={handleLisSkinsSave}
              className="w-full bg-[#5B4BFF] rounded-[16px] px-4 py-3 text-white font-semibold hover:bg-[#7B6BFF] transition-colors shadow-[0_0_20px_rgba(91,75,255,0.4)]"
            >
              Сохранить
            </button>
          </div>
          {lisSkinsSaved && (
            <span className="text-xs text-[#00FF9D] font-semibold">Сохранено</span>
          )}

          <div className="pt-2 rounded-[14px] border border-white/10 bg-white/5 px-4 py-2 text-[15px] leading-tight text-[#b3b3ff] space-y-0.5">
            <p>Ниже прописана механика ручной отправки скинов с указанием конкретной трейд-ссылки.</p>
            <p>Заполните необходимые поля и нажмите отправить.</p>
            <p className="mt-1 text-[13px] uppercase tracking-[0.12em] text-white/50 text-center">|ОПЦИОНАЛЬНО|</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm text-[#b3b3ff] mb-2 block">Steam trade link</label>
              <input
                type="text"
                value={lisSkinsTradeLink}
                onChange={(e) => setLisSkinsTradeLink(e.target.value)}
                placeholder="Вставьте трейд-ссылку"
                className="w-full bg-white/5 border border-white/10 rounded-[16px] px-4 py-3 text-white placeholder:text-[#b3b3ff]/70 focus:outline-none focus:border-[#5B4BFF] transition-colors"
              />
            </div>

            <div>
              <label className="text-sm text-[#b3b3ff] mb-2 block">Цена (USD)</label>
              <input
                type="text"
                inputMode="decimal"
                value={lisSkinsPrice}
                onChange={(e) => setLisSkinsPrice(e.target.value)}
                placeholder="0.00"
                className="w-full bg-white/5 border border-white/10 rounded-[16px] px-4 py-3 text-white placeholder:text-[#b3b3ff]/70 focus:outline-none focus:border-[#5B4BFF] transition-colors"
              />
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setLisSkinsGame('cs2')}
                className={`flex-1 rounded-[14px] px-4 py-2.5 text-sm font-semibold transition-colors ${
                  lisSkinsGame === 'cs2'
                    ? 'bg-[#5B4BFF] text-white shadow-[0_0_18px_rgba(91,75,255,0.35)]'
                    : 'bg-white/5 text-[#b3b3ff] border border-white/10'
                }`}
              >
                CS2
              </button>
              <button
                type="button"
                onClick={() => setLisSkinsGame('dota2')}
                className={`flex-1 rounded-[14px] px-4 py-2.5 text-sm font-semibold transition-colors ${
                  lisSkinsGame === 'dota2'
                    ? 'bg-[#5B4BFF] text-white shadow-[0_0_18px_rgba(91,75,255,0.35)]'
                    : 'bg-white/5 text-[#b3b3ff] border border-white/10'
                }`}
              >
                DOTA2
              </button>
            </div>

            <button
              type="button"
              onClick={handleLisSkinsSend}
              disabled={lisSkinsSending}
              className="w-full bg-[#5B4BFF] rounded-[16px] px-4 py-3 text-white font-semibold hover:bg-[#7B6BFF] transition-colors shadow-[0_0_20px_rgba(91,75,255,0.4)] disabled:opacity-60"
            >
              {lisSkinsSending ? "Отправка..." : "Отправить"}
            </button>
          </div>
        </div>
      </div>

      <div className="yuze-glass rounded-[24px] p-6">
        <button
          type="button"
          onClick={() => setIsStreamElementOpen((prev) => !prev)}
          className="flex w-full items-center justify-between text-left"
          aria-expanded={isStreamElementOpen}
        >
          <div className="flex items-center gap-3">
            <img src={keyIcon} alt="" className="w-6 h-6" aria-hidden="true" />
            <h3 className="text-lg font-bold text-white">Stream Element</h3>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-[#b3b3ff] transition-transform ${
              isStreamElementOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        <div className={`mt-4 space-y-3 ${isStreamElementOpen ? 'block' : 'hidden'}`}>
          <div className="relative">
            <label className="text-sm text-[#b3b3ff] mb-2 block">Channel ID</label>
            <input
              type="text"
              value={channelId}
              onChange={(e) => {
                setChannelId(e.target.value);
                setStreamElementSaved(false);
              }}
              placeholder="Введите Channel ID"
              className="w-full bg-white/5 border border-white/10 rounded-[16px] pl-4 pr-11 py-3 text-white placeholder:text-[#b3b3ff]/70 focus:outline-none focus:border-[#5B4BFF] transition-colors"
            />
            <img
              src={streamElementSaved ? lockKeyIcon : unlockIcon}
              alt=""
              className="absolute right-4 top-[42px] h-5 w-5 opacity-80"
              aria-hidden="true"
            />
          </div>

          <div className="relative">
            <label className="text-sm text-[#b3b3ff] mb-2 block">API JWT Token</label>
            <input
              type="password"
              value={apiToken}
              onChange={(e) => {
                setApiToken(e.target.value);
                setStreamElementSaved(false);
              }}
              placeholder="Введите API JWT токен"
              className="w-full bg-white/5 border border-white/10 rounded-[16px] pl-4 pr-11 py-3 text-white placeholder:text-[#b3b3ff]/70 focus:outline-none focus:border-[#5B4BFF] transition-colors"
            />
            <img
              src={streamElementSaved ? lockKeyIcon : unlockIcon}
              alt=""
              className="absolute right-4 top-[42px] h-5 w-5 opacity-80"
              aria-hidden="true"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              onClick={handleStreamElementSave}
              className="flex-1 bg-[#5B4BFF] rounded-[16px] px-4 py-3 text-white font-semibold hover:bg-[#7B6BFF] transition-colors shadow-[0_0_20px_rgba(91,75,255,0.4)]"
            >
              Сохранить
            </button>
            <button
              onClick={handleStreamElementReset}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-[16px] text-[#b3b3ff] font-medium hover:bg-white/10 transition-colors"
            >
              Сбросить
            </button>
            <button
              onClick={handleStreamElementTest}
              className="px-4 py-3 bg-white/5 border border-white/10 rounded-[16px] text-[#b3b3ff] font-medium hover:bg-white/10 transition-colors"
            >
              Тест
            </button>
          </div>

          <div className="mt-3 rounded-[16px] border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-white font-semibold">
              <img src={infoIcon} alt="" className="w-5 h-5" aria-hidden="true" />
              <span>Как найти ТОКЕН:</span>
            </div>
            <ol className="mt-2 list-decimal pl-5 text-sm text-[#b3b3ff] space-y-1">
              <li>Войдите в свой аккаунт StreamElements.</li>
              <li>Нажмите на иконку аккаунта (в правом верхнем углу, там же, где и иконка вашего канала).</li>
              <li>Нажмите на название канала, чтобы перейти на страницу аккаунта.</li>
              <li>В разделе «Channels» в строке вашего канала включите переключатель Show Secrets.</li>
              <li>Скопируйте свой токен JWT.</li>
            </ol>
          </div>
        </div>
      </div>

      <div className="yuze-glass rounded-[24px] p-6">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <img src={flyIcon} alt="" className="w-6 h-6" aria-hidden="true" />
            <h3 className="text-lg font-bold text-white">TG канал стримера</h3>
          </div>
          {telegramSaved && (
            <span className="text-xs text-[#00FF9D] font-semibold">Сохранено</span>
          )}
        </div>

        <div className="relative">
          <input
            type="text"
            value={telegramChannel}
            onChange={(e) => {
              setTelegramChannel(e.target.value);
              setTelegramSaved(false);
            }}
            placeholder="Ссылка на Telegram-канал"
            className="w-full bg-white/5 border border-white/10 rounded-[16px] pl-4 pr-11 py-3 text-white placeholder:text-[#b3b3ff]/70 focus:outline-none focus:border-[#5B4BFF] transition-colors"
          />
          <img
            src={telegramSaved && telegramChannel.trim() ? lockKeyIcon : unlockIcon}
            alt=""
            className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 opacity-80"
            aria-hidden="true"
          />
        </div>

        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={handleTelegramSave}
            className="flex-1 bg-[#5B4BFF] rounded-[16px] px-4 py-3 text-white font-semibold hover:bg-[#7B6BFF] transition-colors shadow-[0_0_20px_rgba(91,75,255,0.4)]"
          >
            Сохранить
          </button>
        </div>
      </div>

      <div className="yuze-glass rounded-[24px] p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <img src={steamIcon} alt="" className="w-6 h-6" aria-hidden="true" />
            <h3 className="text-lg font-bold text-white">Статус GSI</h3>
          </div>
          {gsiStatus === 'connected' && (
            <div className="bg-[#00FF9D]/20 border border-[#00FF9D]/30 rounded-full px-3 py-1">
              <span className="text-xs text-[#00FF9D] font-medium">Подключено</span>
            </div>
          )}
          {gsiStatus === 'error' && (
            <div className="bg-red-500/20 border border-red-500/30 rounded-full px-3 py-1">
              <span className="text-xs text-red-500 font-medium">Ошибка</span>
            </div>
          )}
        </div>

        <button
          onClick={handleGsiCheck}
          className="w-full bg-[#5B4BFF] rounded-[16px] px-4 py-3 text-white font-semibold hover:bg-[#7B6BFF] transition-colors shadow-[0_0_20px_rgba(91,75,255,0.4)]"
        >
          Проверить
        </button>
      </div>

    </div>
  );
}
