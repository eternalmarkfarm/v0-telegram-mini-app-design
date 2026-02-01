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
        <div className="prom-status-badge text-[#7BB6FF]">
          <div className="prom-status-wrapper">
            <img src={deliveryOneIcon} alt="Delivery" className="prom-status-icon object-contain" />
          </div>
          <div className="prom-status-text">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs">Processing</span>
          </div>
        </div>
      );
    case 'sent':
      return (
        <div className="prom-status-badge text-[#b3b3ff]">
          <div className="prom-status-wrapper">
            <img src={iconDelivery} alt="Delivery" className="prom-status-icon object-contain" />
          </div>
          <div className="prom-status-text">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#7BB6FF]" />
            <span className="text-xs">Delivery</span>
          </div>
        </div>
      );
    case 'received':
      return (
        <div className="prom-status-badge text-[#b3b3ff]">
          <div className="prom-status-wrapper">
            <img src={iconReceived} alt="Received" className="prom-status-icon object-contain" />
          </div>
          <div className="prom-status-text" aria-hidden="true">
            &nbsp;
          </div>
        </div>
      );
    case 'missed':
      return (
        <div className="prom-status-badge text-[#ff9b9b]">
          <div className="prom-status-wrapper">
            <img src={warningIcon} alt="Warning" className="prom-status-icon object-contain" />
          </div>
          <div className="prom-status-text text-[#b3b3ff]">
            <img src={crossIcon} alt="Missed" className="w-4 h-4" />
            <span className="text-xs">{getDeadlineTime(deadline)}</span>
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
    <div className="prom-prize-card yuze-glass rounded-[16px] px-5 py-4 overflow-hidden" style={{ containerType: 'inline-size' }}>
      <div className="flex items-start">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <div className="prom-prize-avatar relative w-[68px] h-[68px] shrink-0">
            <img
              src={avatarSrc}
              alt={prize.winnerNick}
              className="w-full h-full rounded-full object-cover border border-white/10 shadow-[0_0_16px_rgba(91,75,255,0.25)]"
            />
            <div
              className="prom-game-icon absolute right-0 bottom-0 w-6 h-6 rounded-full bg-[#0e1220] border border-white/10 flex items-center justify-center"
              title={gameLabel}
            >
              <img src={gameIcon} alt={gameLabel} className="w-4 h-4" />
            </div>
          </div>
          <div className="prom-prize-grid grid grid-cols-[minmax(0,1fr)_auto] items-start gap-2 min-w-0">
            <div className="prom-prize-col-left flex flex-col min-w-0 order-1 overflow-hidden">
              <div className="flex items-center gap-1.5 text-[11px] text-[#b3b3ff] h-6 min-w-0">
                <span className="w-4 h-4 shrink-0 flex items-center justify-center">
                  <img src={trophyIcon} alt="Trophy" className="prom-prize-icon w-4 h-4" />
                </span>
                <span className="prom-prize-meta prom-prize-nick truncate flex-1 min-w-0">@{prize.winnerNick}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#b3b3ff] mt-1 min-w-0">
                <span className="w-4 h-4 shrink-0 flex items-center justify-center">
                  <img src={microphoneIcon} alt="Streamer" className="prom-prize-icon w-4 h-4" />
                </span>
                <span className="prom-prize-meta prom-prize-nick truncate flex-1 min-w-0">@{prize.streamerName}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#b3b3ff] mt-1 min-w-0">
                <span className="w-4 h-4 shrink-0 flex items-center justify-center">
                  <img src={timeIcon} alt="Time" className="prom-prize-icon w-4 h-4" />
                </span>
                <span className="prom-prize-meta prom-prize-time whitespace-nowrap">{prize.time}</span>
              </div>
            </div>
            <div className="prom-prize-col-right flex flex-col min-w-0 order-2">
              <div className="flex items-center gap-1.5 text-[12px] text-white font-medium h-6 min-w-0">
                <span className="w-4 h-4 shrink-0 flex items-center justify-center">
                  <img src={fireIcon} alt="Fire" className="prom-prize-icon w-4 h-4" />
                </span>
                <span className="prom-prize-trigger truncate flex-1 min-w-0">{prize.trigger}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-1 text-[11px] text-[#b3b3ff] min-w-0">
                <span className="w-4 h-4 shrink-0 flex items-center justify-center">
                  <img src={dollarSignIcon} alt="Price" className="prom-prize-icon prom-prize-dollar w-4 h-4" />
                </span>
                <span className="prom-prize-meta prom-prize-price whitespace-nowrap">{prize.price}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px] text-[#b3b3ff] mt-1 min-w-0">
                <span className="w-4 h-4 shrink-0 flex items-center justify-center">
                  <img src={deadlineIcon} alt="Deadline" className="prom-prize-icon w-4 h-4" />
                </span>
                <span className="prom-prize-meta prom-prize-deadline whitespace-nowrap">{prize.deadline}</span>
              </div>
            </div>
            <div className="prom-prize-status">
              <StatusBadge status={prize.status} deadline={prize.deadline} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
