"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useStreamerMe } from "@/app/prom/lib/useStreamerMe";
const iconSuperdropInactive = "/prom/medal_black.svg";
const iconSuperdropActive = "/prom/medal_color.svg";
const diceIcon = "/prom/dice_bw.png";
const diceIconActive = "/prom/dice.png";
const homeIconMask = "/prom/home_b.svg";
const streamerIconMask = "/prom/live_black.svg";
const forStreamersInactive = "/prom/user-setting_new.svg";
const forStreamersActive = "/prom/user-setting_new.svg";


export default function BottomNavigation() {
  const pathname = usePathname();
  const { data: streamerMe } = useStreamerMe();
  const [liveStreamersCount] = useState(3); // Моковые данные для LIVE индикатора
  const hasStreamPanel = Boolean(streamerMe?.streamer?.id);

  const base = "";
  const path = pathname?.startsWith(base) ? pathname.slice(base.length) || "/" : pathname || "/";
  const to = (p: string) => (p === "/" ? "/" : `${base}${p}`);
  const streamPanelPath = hasStreamPanel ? to('/stream-panel') : to('/begin-streamer');
  const streamPanelLabel = 'For Streamers';
  const diceCutoutMask = 'radial-gradient(46px 46px at 50% 2px, transparent 98%, black 100%)';
  const isDiceSection = path.startsWith('/dice');
  const isStreamersSection = path.startsWith('/streamers');
  const isStreamPanelSection = [
    '/stream-panel',
    '/begin-streamer',
    '/streamer-integrations',
    '/streamer-events',
    '/streamer-stats',
    '/streamer-prizes',
    '/superdrop-settings',
  ].some((segment) => path.startsWith(segment));
  const isSuperdropSection =
    path.startsWith('/superdrop') && !path.startsWith('/superdrop-settings');
  const isHomeSection =
    path === '/' ||
    path.startsWith('/following') ||
    path.startsWith('/prizes') ||
    path.startsWith('/streamer/') ||
    (!isDiceSection && !isStreamersSection && !isStreamPanelSection && !isSuperdropSection);
  const navActiveColor = '#3489FF';
  const navActiveGlow = 'rgba(52,137,255,0.7)';

  return (
    <nav className="prom-bottom-nav fixed bottom-0 left-0 right-0 z-50" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="mx-auto w-full max-w-md px-4">
        {/* Нижняя панель как на рефе */}
        <div className="prom-bottom-nav-inner relative pb-0">
          <div
            className="absolute left-1/2 -translate-x-1/2 top-0 h-full bg-[#202436]/90 backdrop-blur-[22px] border border-white/5 rounded-t-[12px] rounded-b-none"
            style={{
              width: 'calc(100% + 32px)',
              maxWidth: 'calc(28rem + 32px)',
              boxShadow: '0 10px 26px rgba(6, 9, 24, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.06)',
              WebkitMaskImage: diceCutoutMask,
              maskImage: diceCutoutMask,
              WebkitMaskRepeat: 'no-repeat',
              maskRepeat: 'no-repeat',
              WebkitMaskSize: '100% 100%',
              maskSize: '100% 100%',
            }}
          ></div>
          <div
            className="pointer-events-none absolute left-1/2 -translate-x-1/2 top-0 h-full rounded-t-[12px] rounded-b-none border border-white/10"
            style={{
              width: 'calc(100% + 32px)',
              maxWidth: 'calc(28rem + 32px)',
              WebkitMaskImage: diceCutoutMask,
              maskImage: diceCutoutMask,
              WebkitMaskRepeat: 'no-repeat',
              maskRepeat: 'no-repeat',
              WebkitMaskSize: '100% 100%',
              maskSize: '100% 100%',
            }}
          ></div>
          <div className="relative px-1 py-1.5">
            <div className="grid grid-cols-[1fr_1fr_80px_1fr_1fr] items-end">
            <Link
              href={to("/")}
              className="relative flex flex-col items-center gap-0.5 py-1 transition-all duration-300"
            >
              <span
                role="img"
                aria-label="Home"
                className={`w-6 h-6 transition-all duration-300 ${
                  isHomeSection ? 'drop-shadow-[0_0_10px_rgba(52,137,255,0.7)]' : 'opacity-90'
                }`}
                style={{
                  backgroundColor: isHomeSection ? navActiveColor : '#FFFFFF',
                  WebkitMaskImage: `url(${homeIconMask})`,
                  maskImage: `url(${homeIconMask})`,
                  WebkitMaskRepeat: 'no-repeat',
                  maskRepeat: 'no-repeat',
                  WebkitMaskSize: 'contain',
                  maskSize: 'contain',
                  WebkitMaskPosition: 'center',
                  maskPosition: 'center',
                }}
              />
              <span className={`text-[11px] font-medium ${isHomeSection ? 'text-[#b3b3ff]' : 'text-white'}`}>Home</span>
            </Link>

            <Link
              href={to("/superdrop")}
              className="relative flex flex-col items-center gap-0 py-1 transition-all duration-300"
            >
              <img
                src={isSuperdropSection ? iconSuperdropActive : iconSuperdropInactive}
                alt="SuperDrop"
                className={`w-7 h-7 mb-[-1px] transition-all duration-300 ${
                  isSuperdropSection ? 'drop-shadow-[0_0_10px_rgba(52,137,255,0.7)]' : 'opacity-80'
                }`}
                style={isSuperdropSection ? undefined : { filter: 'invert(1) brightness(1.6)' }}
              />
              <span className={`text-[11px] font-medium ${isSuperdropSection ? 'text-[#b3b3ff]' : 'text-white'}`}>SuperDrop</span>
            </Link>

            <div></div>

            <Link
              href={to("/streamers")}
              className="relative flex flex-col items-center gap-0 py-1 transition-all duration-300"
            >
              <div className="relative">
                <span
                  role="img"
                  aria-label="Streamers"
                  className={`inline-block w-7 h-7 relative top-[2px] mb-[-2px] transition-all duration-300 ${
                    isStreamersSection ? 'drop-shadow-[0_0_10px_rgba(52,137,255,0.7)]' : 'opacity-90'
                  } ${liveStreamersCount > 0 ? 'animate-pulse' : ''}`}
                  style={{
                    backgroundColor: isStreamersSection ? navActiveColor : '#FFFFFF',
                    WebkitMaskImage: `url(${streamerIconMask})`,
                    maskImage: `url(${streamerIconMask})`,
                    WebkitMaskRepeat: 'no-repeat',
                    maskRepeat: 'no-repeat',
                    WebkitMaskSize: 'contain',
                    maskSize: 'contain',
                    WebkitMaskPosition: 'center',
                    maskPosition: 'center',
                  }}
                />
              </div>
              <span className={`text-[11px] font-medium ${isStreamersSection ? 'text-[#b3b3ff]' : 'text-white'}`}>On Air</span>
            </Link>

            <Link
              href={streamPanelPath}
              className="relative flex flex-col items-center gap-0.5 py-1 transition-all duration-300"
            >
              {isStreamPanelSection ? (
                <img
                  src={forStreamersActive}
                  alt="For Streamers"
                  className="w-6 h-6 transition-all duration-300 drop-shadow-[0_0_10px_rgba(52,137,255,0.7)]"
                />
              ) : (
                <span
                  role="img"
                  aria-label="For Streamers"
                  className="inline-block w-6 h-6 transition-all duration-300"
                  style={{
                    backgroundColor: '#FFFFFF',
                    WebkitMaskImage: `url(${forStreamersInactive})`,
                    maskImage: `url(${forStreamersInactive})`,
                    WebkitMaskRepeat: 'no-repeat',
                    maskRepeat: 'no-repeat',
                    WebkitMaskSize: 'contain',
                    maskSize: 'contain',
                    WebkitMaskPosition: 'center',
                    maskPosition: 'center',
                    filter: 'drop-shadow(0 0 2px rgba(255,255,255,0.8))',
                  }}
                />
              )}
              <span className={`text-[11px] font-medium leading-[12px] text-center ${isStreamPanelSection ? 'text-[#b3b3ff]' : 'text-white'}`}>
                <span className="block">For</span>
                <span className="block">Streamers</span>
              </span>
            </Link>
            </div>
          </div>

          <div className="absolute left-1/2 -top-[32px] -translate-x-1/2 z-10">
            <Link href={to("/dice")} className="relative">
              <div
                className={`w-[68px] h-[68px] rounded-full border border-white/10 flex items-center justify-center bg-[#202436]/90 ${
                  isDiceSection ? 'ring-1 ring-[#3489FF]/60' : ''
                }`}
                style={{
                  boxShadow: isDiceSection
                    ? '0 18px 34px rgba(5, 8, 24, 0.75), 0 0 18px rgba(52, 137, 255, 0.65), 0 0 36px rgba(52, 137, 255, 0.45), inset 0 4px 10px rgba(255, 255, 255, 0.08)'
                    : '0 18px 34px rgba(5, 8, 24, 0.75), inset 0 4px 10px rgba(255, 255, 255, 0.08)',
                }}
              >
                <img
                  src={isDiceSection ? diceIconActive : diceIcon}
                  alt="Dice"
                  className="w-[60px] h-[60px] object-cover drop-shadow-[0_6px_12px_rgba(0,0,0,0.45)]"
                  style={isDiceSection ? undefined : { filter: 'brightness(1.25) contrast(1.1)' }}
                />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
