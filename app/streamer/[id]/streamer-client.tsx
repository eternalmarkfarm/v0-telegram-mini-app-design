"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Users,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
  Heart,
  MessageCircle,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import { apiDelete, apiGet, apiPost } from "@/lib/api";
import { getEventLabel } from "@/lib/event-labels";

type StreamerProfile = {
  streamer: {
    id: number;
    display_name: string;
    twitch_login?: string | null;
    twitch_display_name?: string | null;
    profile_image_url?: string | null;
    telegram_channel_url?: string | null;
  };
  live: {
    is_live: boolean;
    viewer_count: number;
    game_name?: string | null;
    title?: string | null;
    started_at?: string | null;
  };
  stats: {
    total_prizes: number;
    total_amount: number;
    stream_prizes: number;
    stream_amount: number;
    stream_participants: number;
  };
  recent_prizes: Array<{
    id: number;
    skin_name?: string | null;
    skin_price?: number | null;
    delivery_status?: string | null;
    created_at?: string | null;
    event_key?: string | null;
    twitch_login?: string | null;
  }>;
};

export default function StreamerDetailClient({ id }: { id?: string }) {
  const { language } = useI18n();
  const [data, setData] = useState<StreamerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trackedIds, setTrackedIds] = useState<Set<number>>(new Set());
  const [trackingBusy, setTrackingBusy] = useState(false);
  const [resolvedId, setResolvedId] = useState<string | null>(id ?? null);
  const [quietLoading, setQuietLoading] = useState(false);
  const [eligibility, setEligibility] = useState<boolean | null>(null);
  const [eligibilityDetails, setEligibilityDetails] = useState<any>(null);
  const [eligibilityLoading, setEligibilityLoading] = useState(false);

  const formatDate = (value?: string | null) => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date.toLocaleString(language === "ru" ? "ru-RU" : "en-US", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  useEffect(() => {
    if (id) {
      setResolvedId(id);
      return;
    }
    if (typeof window === "undefined") return;
    const parts = window.location.pathname.split("/").filter(Boolean);
    const maybeId = parts[parts.length - 1];
    if (maybeId && maybeId !== "streamer") {
      setResolvedId(maybeId);
    }
  }, [id]);

  const load = async () => {
    if (data) {
      setQuietLoading(true);
    } else {
      setLoading(true);
    }
    setError(null);
    try {
      if (!resolvedId) {
        throw new Error("Missing streamer id");
      }
      const profile = await apiGet(`/streamers/${resolvedId}`);
      setData(profile);
      const tracked = await apiGet("/viewer/tracked").catch(() => ({ streamers: [] }));
      const ids = new Set<number>((tracked?.streamers ?? []).map((s: any) => Number(s.id)));
      setTrackedIds(ids);
    } catch (e) {
      console.error("Failed to load streamer profile:", e);
      setData(null);
      setError(String((e as any)?.message ?? e));
    } finally {
      setLoading(false);
      setQuietLoading(false);
    }
  };

  useEffect(() => {
    if (!resolvedId) return;
    load();
  }, [resolvedId]);

  useEffect(() => {
    if (!resolvedId) return;
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [resolvedId]);

  const streamer = data?.streamer;
  const isTracked = streamer ? trackedIds.has(streamer.id) : false;

  const handleTrack = async () => {
    if (!streamer?.twitch_login) return;
    setTrackingBusy(true);
    try {
      await apiPost("/viewer/tracked", { twitch_login: streamer.twitch_login });
      setTrackedIds((prev) => new Set(prev).add(streamer.id));
    } catch (e) {
      console.error("Track error:", e);
    } finally {
      setTrackingBusy(false);
    }
  };

  const handleUntrack = async () => {
    if (!streamer) return;
    setTrackingBusy(true);
    try {
      await apiDelete(`/viewer/tracked/${streamer.id}`);
      setTrackedIds((prev) => {
        const next = new Set(prev);
        next.delete(streamer.id);
        return next;
      });
    } catch (e) {
      console.error("Untrack error:", e);
    } finally {
      setTrackingBusy(false);
    }
  };

  const checkEligibility = async () => {
    if (!streamer?.id) return;
    setEligibilityLoading(true);
    try {
      const res = await apiGet(`/viewer/eligibility?streamer_id=${streamer.id}`);
      setEligibility(Boolean(res?.ok));
      setEligibilityDetails(res);
    } catch (e) {
      console.error("Eligibility check failed:", e);
      setEligibility(false);
      setEligibilityDetails(null);
    } finally {
      setEligibilityLoading(false);
    }
  };

  const statusLabel = (status?: string | null) => {
    if (status === "success") return language === "ru" ? "Получено" : "Received";
    if (status === "sent") return language === "ru" ? "Отправлено" : "Sent";
    if (status === "failed") return language === "ru" ? "Не удалось" : "Failed";
    return language === "ru" ? "В обработке" : "Processing";
  };

  return (
    <main className="min-h-screen bg-background pb-8">
      <div className="mx-auto max-w-md px-4 py-4 space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link href="/live">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">
              {language === "ru" ? "Стример" : "Streamer"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {language === "ru" ? "Информация и розыгрыши" : "Info and giveaways"}
            </p>
          </div>
        </div>

        {loading && !data ? (
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm p-4 text-sm text-muted-foreground">
            Loading...
          </Card>
        ) : error || !data ? (
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm p-4 space-y-2">
            <p className="text-sm text-muted-foreground">
              {language === "ru" ? "Не удалось загрузить стримера." : "Failed to load streamer."}
            </p>
            {error && <p className="text-xs text-red-500">{error}</p>}
            <Button variant="secondary" onClick={load}>
              {language === "ru" ? "Повторить" : "Retry"}
            </Button>
          </Card>
        ) : (
          <>
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="relative">
                  {streamer?.profile_image_url ? (
                    <img
                      src={streamer.profile_image_url}
                      alt={streamer.display_name}
                      className={`h-14 w-14 rounded-full object-cover ring-2 ${
                        data.live.is_live ? "ring-destructive" : "ring-border/50"
                      }`}
                    />
                  ) : (
                    <div className="h-14 w-14 rounded-full bg-secondary flex items-center justify-center text-lg font-bold text-muted-foreground">
                      {(streamer?.display_name || "S").charAt(0).toUpperCase()}
                    </div>
                  )}
                  {data.live.is_live && (
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-destructive ring-2 ring-card animate-pulse" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-base font-semibold text-foreground truncate">
                    {streamer?.twitch_display_name || streamer?.display_name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {data.live.is_live
                      ? language === "ru"
                        ? "В эфире"
                        : "Live"
                      : language === "ru"
                        ? "Оффлайн"
                        : "Offline"}
                    {data.live.game_name ? ` · ${data.live.game_name}` : ""}
                  </p>
                </div>
                {data.live.is_live && (
                  <Badge variant="secondary" className="bg-destructive/20 text-destructive border-0 flex items-center gap-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wide animate-pulse">Live</span>
                    <Users className="h-3 w-3" />
                    {data.live.viewer_count.toLocaleString()}
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  asChild
                  className="h-10 bg-[#9146ff] text-white hover:bg-[#7c3aed]"
                >
                  <a
                    href={streamer?.twitch_login ? `https://twitch.tv/${streamer.twitch_login}` : "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
                    </svg>
                    Twitch
                  </a>
                </Button>
                {isTracked ? (
                  <Button
                    className="h-10 bg-red-500 text-white hover:bg-red-600"
                    onClick={handleUntrack}
                    disabled={trackingBusy}
                  >
                    {language === "ru" ? "Открепить" : "Untrack"}
                  </Button>
                ) : (
                  <Button className="h-10" onClick={handleTrack} disabled={trackingBusy || !streamer?.twitch_login}>
                    {language === "ru" ? "Отслеживать" : "Track"}
                  </Button>
                )}
              </div>
              {streamer?.telegram_channel_url && (
                <Button
                  variant="outline"
                  className="h-10 w-full -mt-1 bg-[#229ED9] text-white hover:bg-[#1d8fc7]"
                  asChild
                >
                  <a href={streamer.telegram_channel_url} target="_blank" rel="noopener noreferrer">
                    <svg className="h-4 w-4 mr-2 text-white" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M22.5 3.1c.3-1.2-1-2.2-2.1-1.7L2.7 8.9c-1.2.5-1.2 1.3-.2 1.6l4.8 1.5 1.9 6.1c.2.6.1.9.8.9.5 0 .8-.2 1.1-.5l2.8-2.7 5.9 4.3c1.1.6 1.9.3 2.2-1.1l3-14.9zM8.1 11.8l9.9-6.2c.5-.3.9.1.5.4l-8 7.2-.3 4.7-1.9-5.9-.2-.2z" />
                    </svg>
                    {language === "ru" ? "TG канал" : "TG channel"}
                  </a>
                </Button>
              )}

              <Button
                className={`h-11 w-full text-base font-semibold ${
                  eligibility === true
                    ? "bg-success text-white hover:bg-success/90"
                    : eligibility === false
                      ? "bg-destructive text-white hover:bg-destructive/90"
                      : "bg-secondary text-foreground hover:bg-secondary/80"
                }`}
                onClick={checkEligibility}
                disabled={eligibilityLoading}
              >
                {eligibilityLoading
                  ? language === "ru"
                    ? "Проверка..."
                    : "Checking..."
                  : eligibility === true
                    ? language === "ru"
                      ? "Участвуешь"
                      : "Eligible"
                    : eligibility === false
                      ? language === "ru"
                        ? "Нет"
                        : "No"
                      : language === "ru"
                        ? "Проверить соблюдения условий"
                        : "Check eligibility"}
              </Button>

              {eligibility === false && eligibilityDetails && (
                <Card className="border-border/50 bg-card/80 backdrop-blur-sm p-3 text-xs text-muted-foreground space-y-1">
                  {!eligibilityDetails.is_tracked && (
                    <p>{language === "ru" ? "Не отслеживаете стримера." : "You are not tracking the streamer."}</p>
                  )}
                  {!eligibilityDetails.has_twitch && (
                    <p>{language === "ru" ? "Не привязан Twitch аккаунт." : "Twitch account not linked."}</p>
                  )}
                  {!eligibilityDetails.has_steam && (
                    <p>{language === "ru" ? "Не указан Steam Trade URL." : "Steam Trade URL not set."}</p>
                  )}
                  {!eligibilityDetails.is_follower && (
                    <p>{language === "ru" ? "Вы не фолловер стримера." : "You are not a follower."}</p>
                  )}
                  {!eligibilityDetails.chat_recent && (
                    <p>{language === "ru" ? "Нет сообщения в чате за последний час." : "No chat message within the last hour."}</p>
                  )}
                </Card>
              )}

              {streamer?.id && (
                <Link href={`/streamer/${streamer.id}/participants`} className="block">
                  <Card className="border-border/50 bg-card/80 backdrop-blur-sm p-3 flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground flex-1">
                      {language === "ru" ? "Все участники" : "All participants"}
                    </span>
                    <ExternalLink className="h-4 w-4 text-muted-foreground" />
                  </Card>
                </Link>
              )}
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm p-3">
                <p className="text-xs text-muted-foreground">
                  {language === "ru" ? "Выдано за стрим" : "Prizes this stream"}
                </p>
                <p className="text-lg font-semibold text-foreground">{data.stats.stream_prizes}</p>
              </Card>
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm p-3">
                <p className="text-xs text-muted-foreground">
                  {language === "ru" ? "Сумма за стрим" : "Amount this stream"}
                </p>
                <p className="text-lg font-semibold text-foreground">
                  {data.stats.stream_amount ? `$${data.stats.stream_amount}` : "$0"}
                </p>
              </Card>
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm p-3">
                <p className="text-xs text-muted-foreground">
                  {language === "ru" ? "Участников сейчас" : "Participants now"}
                </p>
                <p className="text-lg font-semibold text-foreground">{data.stats.stream_participants}</p>
              </Card>
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm p-3">
                <p className="text-xs text-muted-foreground">
                  {language === "ru" ? "За все время выдано призов" : "All-time prizes given"}
                </p>
                <p className="text-lg font-semibold text-foreground">{data.stats.total_prizes}</p>
              </Card>
            </div>

            <Card className="border border-warning/40 bg-warning/15 backdrop-blur-sm p-4 text-sm text-warning flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-warning/20 text-warning">
                <Heart className="h-4 w-4 text-[#9146ff] fill-[#9146ff]" />
              </div>
              <div>
                <p className="font-semibold text-warning">
                  {language === "ru" ? "Условия участия" : "Participation rules"}
                </p>
                <p>
                  {language === "ru"
                    ? "Чтобы участвовать, нужно быть фоловером стримера, отслеживать его и писать в чат хотя бы раз в час."
                    : "To participate you should follow the streamer, track them, and send a chat message at least once per hour."}
                </p>
                <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-warning/90">
                  <MessageCircle className="h-3.5 w-3.5" />
                  {language === "ru" ? "Напишите в чат" : "Say hi in chat"}
                </div>
              </div>
            </Card>


            <div>
              <div className="flex items-center justify-between mb-3 px-1">
                <h2 className="text-sm font-medium text-muted-foreground">
                  {language === "ru" ? "Последние выдачи" : "Recent prizes"}
                </h2>
                <Link href={`/streamer/${streamer?.id}/prizes`} className="text-xs text-muted-foreground">
                  {language === "ru" ? "Все" : "All"}
                </Link>
              </div>
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm divide-y divide-border/50">
                {data.recent_prizes.length === 0 ? (
                  <div className="p-4 text-sm text-muted-foreground">
                    {language === "ru" ? "Пока нет выдач" : "No prizes yet"}
                  </div>
                ) : (
                  data.recent_prizes.map((prize) => (
                    <div key={prize.id} className="p-3 flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary/60">
                        {prize.delivery_status === "success" ? (
                          <CheckCircle className="h-4 w-4 text-success" />
                        ) : prize.delivery_status === "failed" ? (
                          <XCircle className="h-4 w-4 text-destructive" />
                        ) : (
                          <Clock className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {prize.skin_name || (language === "ru" ? "Скин" : "Skin")}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {prize.twitch_login ? `@${prize.twitch_login}` : language === "ru" ? "Зритель" : "Viewer"}
                        </p>
                        {prize.event_key && (
                          <p className="text-[11px] text-muted-foreground">
                            {language === "ru" ? "Событие:" : "Event:"} {getEventLabel(prize.event_key, language)}
                          </p>
                        )}
                        {prize.created_at && (
                          <p className="text-[11px] text-muted-foreground">{formatDate(prize.created_at)}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{statusLabel(prize.delivery_status)}</p>
                        {prize.skin_price !== null && prize.skin_price !== undefined && (
                          <p className="text-sm font-medium text-foreground">${prize.skin_price}</p>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </Card>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
