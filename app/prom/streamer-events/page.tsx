"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useRouter } from "next/navigation";
import { apiGet, apiPost } from "@/lib/api";
import { ensureAuth } from "@/lib/ensureAuth";
const leftArrowIcon = "/prom/left-arrow.svg";
const fireIcon = "/prom/fire.svg";
const dotaIcon = "/prom/icons8-dota-2-64.png";
const dollarSignIcon = "/prom/dollar-sign.svg";
const customerExperienceIcon = "/prom/customer-experience.svg";
const unlockIcon = "/prom/unlock.svg";
const lockKeyIcon = "/prom/lock_key.svg";
const cs2Icon = "/prom/cs2.png";


const events = [
  { title: 'Пик Puck (единожды за матч)', code: 'dota.pick_puck' },
  { title: 'Пик Shadow Fiend (единожды за матч)', code: 'dota.pick_sf' },
  { title: 'Пик Lina (единожды за матч)', code: 'dota.pick_lina' },
  { title: 'Пик Void Spirit (единожды за матч)', code: 'dota.pick_void_spirit' },
  { title: 'Первая кровь (единожды за матч)', code: 'dota.first_blood' },
  { title: 'Двойное убийство (каждое событие за матч)', code: 'dota.double_kill' },
  { title: 'Тройное убийство (каждое событие за матч)', code: 'dota.triple_kill' },
  { title: 'Ультра убийство (каждое событие за матч)', code: 'dota.ultra_kill' },
  { title: 'Рампейдж (каждое событие за матч)', code: 'dota.rampage' },
  { title: '20 убийств (единожды за матч)', code: 'dota.kills_20' },
  { title: '10к нетворс до 11 минуты (единожды за матч)', code: 'dota.net_worth_10k_11' },
  { title: '20к нетворс (единожды за матч)', code: 'dota.net_worth_20k' },
  { title: '40к нетворс (единожды за матч)', code: 'dota.net_worth_40k' },
  { title: 'Крипы > 10×минута (единожды за матч)', code: 'dota.lh_minute_threshold' },
  { title: 'Игра 2 часа+ (единожды за матч)', code: 'dota.two_hours' },
  { title: 'Купил смок (единожды за матч)', code: 'dota.buy_smoke' },
  { title: 'Взял аегис (единожды за матч)', code: 'dota.aegis' },
  { title: 'Взял сыр (единожды за матч)', code: 'dota.cheese' },
  { title: 'Взял знамя рошана (единожды за матч)', code: 'dota.roshan_banner' },
  { title: 'Взял рефрешер (единожды за матч)', code: 'dota.refresher_shard' },
  { title: 'Серия побед (единожды за матч)', code: 'dota.win_streak' },
  { title: 'Серия поражений (единожды за матч)', code: 'dota.loss_streak' },
];

const cs2Events = [
  { title: 'Первая кровь', code: 'cs2.first_kill' },
  { title: 'Убийство в голову', code: 'cs2.headshot' },
  { title: 'Двойное убийство', code: 'cs2.double_kill' },
  { title: 'Тройное убийство', code: 'cs2.triple_kill' },
  { title: 'Четыре убийства', code: 'cs2.quad_kill' },
  { title: 'Эйс', code: 'cs2.ace' },
  { title: 'Клатч 1v2', code: 'cs2.clutch_1v2' },
  { title: 'Клатч 1v3', code: 'cs2.clutch_1v3' },
  { title: 'Клатч 1v4', code: 'cs2.clutch_1v4' },
  { title: 'Клатч 1v5', code: 'cs2.clutch_1v5' },
  { title: 'Убийство ножом', code: 'cs2.knife_kill' },
  { title: 'Убийство гранатой', code: 'cs2.grenade_kill' },
  { title: 'Заложена бомба', code: 'cs2.bomb_planted' },
  { title: 'Обезврежена бомба', code: 'cs2.bomb_defused' },
  { title: 'Взрыв бомбы', code: 'cs2.bomb_exploded' },
  { title: 'Победа в раунде', code: 'cs2.round_win' },
];

export default function StreamerEvents() {
  const router = useRouter();
  const [isDotaOpen, setIsDotaOpen] = useState(false);
  const [isCs2Open, setIsCs2Open] = useState(false);
  const [eventsState, setEventsState] = useState(
    events.map((event, index) => ({
      ...event,
      active: false,
      order: index,
      maxPrice: '',
      winnersCount: '',
      locked: false,
    }))
  );
  const [cs2State, setCs2State] = useState(
    cs2Events.map((event, index) => ({
      ...event,
      active: false,
      order: index,
      maxPrice: '',
      winnersCount: '',
      locked: false,
    }))
  );
  const [bulkPrice, setBulkPrice] = useState('');
  const [bulkWinners, setBulkWinners] = useState('');
  const [bulkPriceCs2, setBulkPriceCs2] = useState('');
  const [bulkWinnersCs2, setBulkWinnersCs2] = useState('');
  const itemRefs = useRef(new Map<string, HTMLDivElement>());
  const positionsRef = useRef(new Map<string, DOMRect>());
  const cs2ItemRefs = useRef(new Map<string, HTMLDivElement>());
  const cs2PositionsRef = useRef(new Map<string, DOMRect>());

  useEffect(() => {
    const load = async () => {
      try {
        await ensureAuth();
        const res = await apiGet("/streamer/me");
        const saved = res?.events ?? [];
        const byKey = new Map(saved.map((e: any) => [e.event_key, e]));

        setEventsState((prev) =>
          prev.map((event) => {
            const savedEvent = byKey.get(event.code);
            if (!savedEvent) return event;
            return {
              ...event,
              active: Boolean(savedEvent.enabled),
              maxPrice: savedEvent.price_max != null ? String(savedEvent.price_max) : event.maxPrice,
              winnersCount: savedEvent.winners_count != null ? String(savedEvent.winners_count) : event.winnersCount,
              locked: Boolean(savedEvent.enabled),
            };
          })
        );

        setCs2State((prev) =>
          prev.map((event) => {
            const savedEvent = byKey.get(event.code);
            if (!savedEvent) return event;
            return {
              ...event,
              active: Boolean(savedEvent.enabled),
              maxPrice: savedEvent.price_max != null ? String(savedEvent.price_max) : event.maxPrice,
              winnersCount: savedEvent.winners_count != null ? String(savedEvent.winners_count) : event.winnersCount,
              locked: Boolean(savedEvent.enabled),
            };
          })
        );
      } catch (e) {
        console.error("Failed to load streamer events:", e);
      }
    };
    load();
  }, []);

  const saveEvent = async (event: { code: string; active: boolean; maxPrice: string; winnersCount: string }) => {
    try {
      await ensureAuth();
      const price = Number(event.maxPrice);
      const winners = Number(event.winnersCount);
      await apiPost("/streamer/events", {
        event_key: event.code,
        enabled: event.active,
        price_max: Number.isFinite(price) ? price : undefined,
        winners_count: Number.isFinite(winners) ? winners : undefined,
      });
    } catch (e) {
      console.error("Failed to save event:", e);
    }
  };

  const sortedEvents = useMemo(() => {
    return [...eventsState].sort((a, b) => {
      if (a.active === b.active) return a.order - b.order;
      return a.active ? -1 : 1;
    });
  }, [eventsState]);

  const sortedCs2Events = useMemo(() => {
    return [...cs2State].sort((a, b) => {
      if (a.active === b.active) return a.order - b.order;
      return a.active ? -1 : 1;
    });
  }, [cs2State]);

  useLayoutEffect(() => {
    const newPositions = new Map<string, DOMRect>();

    sortedEvents.forEach((event) => {
      const element = itemRefs.current.get(event.code);
      if (!element) return;
      const rect = element.getBoundingClientRect();
      newPositions.set(event.code, rect);

      const prevRect = positionsRef.current.get(event.code);
      if (prevRect) {
        const dx = prevRect.left - rect.left;
        const dy = prevRect.top - rect.top;
        if (dx || dy) {
          element.style.transition = 'none';
          element.style.transform = `translate(${dx}px, ${dy}px)`;
          element.getBoundingClientRect();
          requestAnimationFrame(() => {
            element.style.transition = 'transform 260ms ease-out';
            element.style.transform = 'translate(0, 0)';
            const handle = () => {
              element.style.transition = '';
              element.removeEventListener('transitionend', handle);
            };
            element.addEventListener('transitionend', handle);
          });
        }
      }
    });

    positionsRef.current = newPositions;

  }, [sortedEvents]);

  useLayoutEffect(() => {
    const newPositions = new Map<string, DOMRect>();

    sortedCs2Events.forEach((event) => {
      const element = cs2ItemRefs.current.get(event.code);
      if (!element) return;
      const rect = element.getBoundingClientRect();
      newPositions.set(event.code, rect);

      const prevRect = cs2PositionsRef.current.get(event.code);
      if (prevRect) {
        const dx = prevRect.left - rect.left;
        const dy = prevRect.top - rect.top;
        if (dx || dy) {
          element.style.transition = 'none';
          element.style.transform = `translate(${dx}px, ${dy}px)`;
          element.getBoundingClientRect();
          requestAnimationFrame(() => {
            element.style.transition = 'transform 260ms ease-out';
            element.style.transform = 'translate(0, 0)';
            const handle = () => {
              element.style.transition = '';
              element.removeEventListener('transitionend', handle);
            };
            element.addEventListener('transitionend', handle);
          });
        }
      }
    });

    cs2PositionsRef.current = newPositions;
  }, [sortedCs2Events]);

  const toggleEvent = (code: string) => {
    setEventsState((prev) =>
      prev.map((event) => {
        if (event.code !== code) return event;
        const next = { ...event, active: !event.active };
        saveEvent(next);
        return next;
      })
    );
  };

  const updateEventPrice = (code: string, value: string) => {
    setEventsState((prev) =>
      prev.map((event) =>
        event.code === code ? { ...event, maxPrice: value, locked: false } : event
      )
    );
  };

  const updateEventWinners = (code: string, value: string) => {
    setEventsState((prev) =>
      prev.map((event) =>
        event.code === code ? { ...event, winnersCount: value, locked: false } : event
      )
    );
  };

  const toggleEventLock = (code: string) => {
    setEventsState((prev) =>
      prev.map((event) => {
        if (event.code !== code) return event;
        const next = { ...event, locked: !event.locked };
        if (!event.locked) saveEvent(next);
        return next;
      })
    );
  };

  const applyBulkSettings = () => {
    setEventsState((prev) =>
      prev.map((event) => {
        const next = { ...event, active: true, maxPrice: bulkPrice, winnersCount: bulkWinners, locked: true };
        saveEvent(next);
        return next;
      })
    );
  };

  const toggleCs2Event = (code: string) => {
    setCs2State((prev) =>
      prev.map((event) => {
        if (event.code !== code) return event;
        const next = { ...event, active: !event.active };
        saveEvent(next);
        return next;
      })
    );
  };

  const updateCs2Price = (code: string, value: string) => {
    setCs2State((prev) =>
      prev.map((event) =>
        event.code === code ? { ...event, maxPrice: value, locked: false } : event
      )
    );
  };

  const updateCs2Winners = (code: string, value: string) => {
    setCs2State((prev) =>
      prev.map((event) =>
        event.code === code ? { ...event, winnersCount: value, locked: false } : event
      )
    );
  };

  const toggleCs2Lock = (code: string) => {
    setCs2State((prev) =>
      prev.map((event) => {
        if (event.code !== code) return event;
        const next = { ...event, locked: !event.locked };
        if (!event.locked) saveEvent(next);
        return next;
      })
    );
  };

  const applyBulkSettingsCs2 = () => {
    setCs2State((prev) =>
      prev.map((event) => {
        const next = {
          ...event,
          active: true,
          maxPrice: bulkPriceCs2,
          winnersCount: bulkWinnersCs2,
          locked: true,
        };
        saveEvent(next);
        return next;
      })
    );
  };

  return (
    <div className="max-w-md mx-auto px-4 py-6 space-y-4 font-['Space_Grotesk'] text-[17px]" style={{ overflowAnchor: 'none' }}>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => router.back()}
          className="w-8 h-8 rounded-[8px] bg-white/5 border border-white/10 flex items-center justify-center"
          aria-label="Назад"
        >
          <img src={leftArrowIcon} alt="" className="w-5 h-5" aria-hidden="true" />
        </button>
        <img src={fireIcon} alt="" className="w-6 h-6" aria-hidden="true" />
        <h1 className="text-white font-bold text-lg">События</h1>
      </div>

      <div className="yuze-glass rounded-[20px] p-4 min-h-[76px]" style={{ overflowAnchor: 'none' }}>
        <button
          type="button"
          onClick={() => setIsDotaOpen((prev) => !prev)}
          className="flex w-full items-center justify-between text-left h-[44px]"
          aria-expanded={isDotaOpen}
        >
          <div className="flex items-center gap-3">
            <img src={dotaIcon} alt="" className="w-8 h-8" aria-hidden="true" />
            <h2 className="text-white font-bold text-lg">DOTA</h2>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-[#b3b3ff] transition-transform ${
              isDotaOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isDotaOpen && (
          <div className="mt-4 rounded-[16px] border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <img src={fireIcon} alt="" className="w-5 h-5" aria-hidden="true" />
                <p className="text-white font-semibold">Настройки для всех событий</p>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-3">
              <div className="flex items-center gap-2 flex-1">
                <img src={dollarSignIcon} alt="" className="w-5 h-5" aria-hidden="true" />
                <input
                  type="text"
                  inputMode="decimal"
                  value={bulkPrice}
                  onChange={(e) => setBulkPrice(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-white/5 border border-white/10 rounded-[12px] px-3 py-2 text-sm text-white placeholder:text-[#b3b3ff]/70 focus:outline-none focus:border-[#5B4BFF] transition-colors"
                />
              </div>
              <div className="flex items-center gap-2 flex-1">
                <img src={customerExperienceIcon} alt="" className="w-5 h-5" aria-hidden="true" />
                <input
                  type="text"
                  inputMode="numeric"
                  value={bulkWinners}
                  onChange={(e) => setBulkWinners(e.target.value)}
                  placeholder="0"
                  className="w-full bg-white/5 border border-white/10 rounded-[12px] px-3 py-2 text-sm text-white placeholder:text-[#b3b3ff]/70 focus:outline-none focus:border-[#5B4BFF] transition-colors"
                />
              </div>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onPointerDown={(e) => e.preventDefault()}
                onClick={applyBulkSettings}
                onFocus={(e) => e.currentTarget.blur()}
                tabIndex={-1}
                className="rounded-[12px] px-4 py-2 text-sm font-semibold transition-colors bg-[#5B4BFF] text-white shadow-[0_0_18px_rgba(91,75,255,0.35)] hover:bg-[#7B6BFF]"
              >
                Применить
              </button>
            </div>
          </div>
        )}

        <div
          className={`mt-3 space-y-2 ${isDotaOpen ? 'block' : 'hidden'}`}
          style={{ overflowAnchor: 'none' }}
        >
          {sortedEvents.map((event) => (
            <div
              key={event.code}
              ref={(node) => {
                if (node) itemRefs.current.set(event.code, node);
                else itemRefs.current.delete(event.code);
              }}
              className="rounded-[16px]"
            >
              <div
                className="yuze-glass rounded-[16px] px-4 py-3 transition-colors"
                style={
                  event.active
                    ? {
                        background:
                          'linear-gradient(135deg, rgba(115, 160, 255, 0.18), rgba(60, 110, 255, 0.08))',
                        borderColor: 'rgba(115, 160, 255, 0.4)',
                      }
                    : undefined
                }
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-white font-semibold">{event.title}</p>
                <div
                  role="switch"
                  aria-checked={event.active}
                  onPointerDown={(e) => {
                    e.preventDefault();
                    toggleEvent(event.code);
                  }}
                  className={`relative h-6 w-12 rounded-full transition-colors ${
                    event.active ? 'bg-[#5B4BFF]' : 'bg-white/15'
                  }`}
                >
                  <span
                    className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                      event.active ? 'translate-x-6' : 'translate-x-0'
                    }`}
                  />
                </div>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <img src={dollarSignIcon} alt="" className="w-5 h-5" aria-hidden="true" />
                    <input
                      type="text"
                      inputMode="decimal"
                      value={event.maxPrice}
                      onChange={(e) => updateEventPrice(event.code, e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-white/5 border border-white/10 rounded-[12px] px-3 py-2 text-sm text-white placeholder:text-[#b3b3ff]/70 focus:outline-none focus:border-[#5B4BFF] transition-colors"
                    />
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    <img src={customerExperienceIcon} alt="" className="w-5 h-5" aria-hidden="true" />
                    <input
                      type="text"
                      inputMode="numeric"
                      value={event.winnersCount}
                      onChange={(e) => updateEventWinners(event.code, e.target.value)}
                      placeholder="0"
                      className="w-full bg-white/5 border border-white/10 rounded-[12px] px-3 py-2 text-sm text-white placeholder:text-[#b3b3ff]/70 focus:outline-none focus:border-[#5B4BFF] transition-colors"
                    />
                  </div>
                <div
                  role="button"
                  onPointerDown={(e) => {
                    e.preventDefault();
                    toggleEventLock(event.code);
                  }}
                  className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                  aria-pressed={event.locked}
                >
                  <img
                    src={event.locked ? lockKeyIcon : unlockIcon}
                    alt=""
                    className="h-5 w-5"
                    aria-hidden="true"
                  />
                </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="yuze-glass rounded-[20px] p-4 min-h-[76px]" style={{ overflowAnchor: 'none' }}>
        <button
          type="button"
          onClick={() => setIsCs2Open((prev) => !prev)}
          className="flex w-full items-center justify-between text-left h-[44px]"
          aria-expanded={isCs2Open}
        >
          <div className="flex items-center gap-3">
            <img src={cs2Icon} alt="" className="w-8 h-8" aria-hidden="true" />
            <h2 className="text-white font-bold text-lg">CS2</h2>
          </div>
          <ChevronDown
            className={`w-5 h-5 text-[#b3b3ff] transition-transform ${
              isCs2Open ? 'rotate-180' : ''
            }`}
          />
        </button>

        {isCs2Open && (
          <div className="mt-4 rounded-[16px] border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <img src={fireIcon} alt="" className="w-5 h-5" aria-hidden="true" />
                <p className="text-white font-semibold">Настройки для всех событий</p>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-3">
              <div className="flex items-center gap-2 flex-1">
                <img src={dollarSignIcon} alt="" className="w-5 h-5" aria-hidden="true" />
                <input
                  type="text"
                  inputMode="decimal"
                  value={bulkPriceCs2}
                  onChange={(e) => setBulkPriceCs2(e.target.value)}
                  placeholder="0.00"
                  className="w-full bg-white/5 border border-white/10 rounded-[12px] px-3 py-2 text-sm text-white placeholder:text-[#b3b3ff]/70 focus:outline-none focus:border-[#5B4BFF] transition-colors"
                />
              </div>
              <div className="flex items-center gap-2 flex-1">
                <img src={customerExperienceIcon} alt="" className="w-5 h-5" aria-hidden="true" />
                <input
                  type="text"
                  inputMode="numeric"
                  value={bulkWinnersCs2}
                  onChange={(e) => setBulkWinnersCs2(e.target.value)}
                  placeholder="0"
                  className="w-full bg-white/5 border border-white/10 rounded-[12px] px-3 py-2 text-sm text-white placeholder:text-[#b3b3ff]/70 focus:outline-none focus:border-[#5B4BFF] transition-colors"
                />
              </div>
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()}
                onPointerDown={(e) => e.preventDefault()}
                onClick={applyBulkSettingsCs2}
                onFocus={(e) => e.currentTarget.blur()}
                tabIndex={-1}
                className="rounded-[12px] px-4 py-2 text-sm font-semibold transition-colors bg-[#5B4BFF] text-white shadow-[0_0_18px_rgba(91,75,255,0.35)] hover:bg-[#7B6BFF]"
              >
                Применить
              </button>
            </div>
          </div>
        )}

        <div
          className={`mt-3 space-y-2 ${isCs2Open ? 'block' : 'hidden'}`}
          style={{ overflowAnchor: 'none' }}
        >
          {sortedCs2Events.map((event) => (
            <div
              key={event.code}
              ref={(node) => {
                if (node) cs2ItemRefs.current.set(event.code, node);
                else cs2ItemRefs.current.delete(event.code);
              }}
              className="rounded-[16px]"
            >
              <div
                className="yuze-glass rounded-[16px] px-4 py-3 transition-colors"
                style={
                  event.active
                    ? {
                        background:
                          'linear-gradient(135deg, rgba(115, 160, 255, 0.18), rgba(60, 110, 255, 0.08))',
                        borderColor: 'rgba(115, 160, 255, 0.4)',
                      }
                    : undefined
                }
              >
                <div className="flex items-center justify-between gap-4">
                  <p className="text-white font-semibold">{event.title}</p>
                  <div
                    role="switch"
                    aria-checked={event.active}
                    onPointerDown={(e) => {
                      e.preventDefault();
                      toggleCs2Event(event.code);
                    }}
                    className={`relative h-6 w-12 rounded-full transition-colors ${
                      event.active ? 'bg-[#5B4BFF]' : 'bg-white/15'
                    }`}
                  >
                    <span
                      className={`absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        event.active ? 'translate-x-6' : 'translate-x-0'
                      }`}
                    />
                  </div>
                </div>
                <div className="mt-2 flex items-center gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <img src={dollarSignIcon} alt="" className="w-5 h-5" aria-hidden="true" />
                    <input
                      type="text"
                      inputMode="decimal"
                      value={event.maxPrice}
                      onChange={(e) => updateCs2Price(event.code, e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-white/5 border border-white/10 rounded-[12px] px-3 py-2 text-sm text-white placeholder:text-[#b3b3ff]/70 focus:outline-none focus:border-[#5B4BFF] transition-colors"
                    />
                  </div>
                  <div className="flex items-center gap-2 flex-1">
                    <img src={customerExperienceIcon} alt="" className="w-5 h-5" aria-hidden="true" />
                    <input
                      type="text"
                      inputMode="numeric"
                      value={event.winnersCount}
                      onChange={(e) => updateCs2Winners(event.code, e.target.value)}
                      placeholder="0"
                      className="w-full bg-white/5 border border-white/10 rounded-[12px] px-3 py-2 text-sm text-white placeholder:text-[#b3b3ff]/70 focus:outline-none focus:border-[#5B4BFF] transition-colors"
                    />
                  </div>
                  <div
                    role="button"
                    onPointerDown={(e) => {
                      e.preventDefault();
                      toggleCs2Lock(event.code);
                    }}
                    className="flex h-10 w-10 items-center justify-center rounded-[10px] border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                    aria-pressed={event.locked}
                  >
                    <img
                      src={event.locked ? lockKeyIcon : unlockIcon}
                      alt=""
                      className="h-5 w-5"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
