import { Loader2 } from 'lucide-react';
const dotaIcon = "/prom/icon8_dota.png";
const cs2Icon = "/prom/cs2.png";
const defaultAvatar = "/prom/twitch_avatar.webp";
const trophyIcon = "/prom/trophy.svg";
const microphoneIcon = "/prom/microphone.svg";
const timeIcon = "/prom/time.svg";
const fireIcon = "/prom/fire.svg";
const dollarSignIcon = "/prom/dollar-sign.svg";
const deadlineIcon = "/prom/deadline.svg";
const deliveryOneIcon = "/prom/delivery_1.svg";
const iconDelivery = "/prom/delivery.svg";
const iconReceived = "/prom/secure.svg";
const warningIcon = "/prom/warning.svg";
const crossIcon = "/prom/cross.svg";


export type PrizeStatus = 'processing' | 'sent' | 'received' | 'missed';

export type PrizeData = {
  id?: string;
  streamerName: string;
  winnerNick: string;
  winnerAvatar?: string;
  skin?: string;
  time: string;
  trigger: string;
  deadline: string;
  price: string;
  status: PrizeStatus;
  game?: 'dota' | 'cs2';
};

const getDeadlineTime = (deadline: string) => deadline.split('.').slice(2).join('.');

const StatusBadge = ({ status, deadline }: { status: PrizeStatus; deadline: string }) => {
  switch (status) {
    case 'processing':
      return (
        <div className="flex flex-col items-center gap-0.5 text-[#7BB6FF] -mt-1">
          <img src={deliveryOneIcon} alt="Delivery" className="w-11 h-11 mt-1.5" />
          <div className="flex items-center gap-1">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs">Processing</span>
          </div>
        </div>
      );
    case 'sent':
      return (
        <div className="flex flex-col items-center gap-1 text-[#b3b3ff] -mt-2">
          <img src={iconDelivery} alt="Delivery" className="w-14 h-14 translate-y-2.5" />
          <div className="flex items-center gap-1">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#7BB6FF]" />
            <span className="text-xs">Delivery</span>
          </div>
        </div>
      );
    case 'received':
      return (
        <div className="flex items-center">
          <img src={iconReceived} alt="Received" className="w-14 h-14 translate-y-2 ml-1" />
        </div>
      );
    case 'missed':
      return (
        <div className="flex flex-col items-center gap-1 text-[#ff9b9b] -mt-1">
          <img src={warningIcon} alt="Warning" className="w-12 h-12" />
          <div className="flex items-center gap-1 text-xs text-[#b3b3ff]">
            <img src={crossIcon} alt="Missed" className="w-4 h-4" />
            <span>{getDeadlineTime(deadline)}</span>
          </div>
        </div>
      );
    default:
      return null;
  }
};

export default function PrizeCard({ prize }: { prize: PrizeData }) {
  const gameIcon = prize.game === 'cs2' ? cs2Icon : dotaIcon;
  const gameLabel = prize.game === 'cs2' ? 'CS2' : 'Dota 2';
  const avatarSrc = prize.winnerAvatar || defaultAvatar;

  return (
    <div className="yuze-glass rounded-[16px] px-5 py-4 overflow-hidden">
      <div className="flex items-start">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="relative w-[68px] h-[68px] shrink-0">
            <img
              src={avatarSrc}
              alt={prize.winnerNick}
              className="w-full h-full rounded-full object-cover border border-white/10 shadow-[0_0_16px_rgba(91,75,255,0.25)]"
            />
            <div
              className="absolute right-0 top-[44px] w-6 h-6 rounded-full bg-[#0e1220] border border-white/10 flex items-center justify-center"
              title={gameLabel}
            >
              <img src={gameIcon} alt={gameLabel} className="w-4 h-4" />
            </div>
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_64px] items-start gap-2 min-w-0">
            <div className="flex flex-col min-w-0 order-1 overflow-hidden">
              <div className="flex items-center gap-0.5 text-[11px] text-[#b3b3ff] -ml-1 h-6 min-w-0">
                <img src={trophyIcon} alt="Trophy" className="w-6 h-6 -ml-0.5" />
                <span className="ml-0.5 truncate flex-1">@{prize.winnerNick}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[#b3b3ff] mt-1 -ml-0.5 min-w-0">
                <img src={microphoneIcon} alt="Streamer" className="w-4 h-4" />
                <span className="truncate flex-1">@{prize.streamerName}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[#b3b3ff] mt-1 -ml-0.5">
                <span className="w-4 h-4 shrink-0 flex items-center justify-center">
                  <img src={timeIcon} alt="Time" className="w-4 h-4" />
                </span>
                <span className="truncate">{prize.time}</span>
              </div>
            </div>
            <div className="flex flex-col min-w-0 order-2 overflow-hidden">
              <div className="flex items-center gap-2 text-[12px] text-white font-medium h-6 min-w-0">
                <span className="w-4 h-4 shrink-0 flex items-center justify-center">
                  <img src={fireIcon} alt="Fire" className="w-4 h-4" />
                </span>
                <span className="truncate flex-1">{prize.trigger}</span>
              </div>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-[#b3b3ff]">
                <span className="w-4 h-4 shrink-0 flex items-center justify-center overflow-visible">
                  <img src={dollarSignIcon} alt="Price" className="w-6 h-6 -ml-1 -mt-1" />
                </span>
                <span>{prize.price}</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-[#b3b3ff] mt-1">
                <span className="w-4 h-4 shrink-0 flex items-center justify-center">
                  <img src={deadlineIcon} alt="Deadline" className="w-4 h-4" />
                </span>
                <span className="truncate">{prize.deadline}</span>
              </div>
            </div>
            <div className="flex flex-col items-center order-3 w-[64px] shrink-0">
              <StatusBadge status={prize.status} deadline={prize.deadline} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
