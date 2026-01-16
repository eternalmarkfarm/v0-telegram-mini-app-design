"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Users,
  Gift,
  ExternalLink,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import { apiDelete, apiGet, apiPost } from "@/lib/api";

type StreamerProfile = {
  streamer: {
    id: number;
    display_name: string;
    twitch_login?: string | null;
    twitch_display_name?: string | null;
    profile_image_url?: string | null;
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
    twitch_login?: string | null;
  }>;
};

export default function StreamerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { language } = useI18n();
  const [data, setData] = useState<StreamerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [trackedIds, setTrackedIds] = useState<Set<number>>(new Set());
  const [trackingBusy, setTrackingBusy] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const profile = await apiGet(`/streamers/${id}`);
      setData(profile);
      const tracked = await apiGet("/viewer/tracked").catch(() => ({ streamers: [] }));
      const ids = new Set<number>((tracked?.streamers ?? []).map((s: any) => Number(s.id)));
      setTrackedIds(ids);
    } catch (e) {
      console.error("Failed to load streamer profile:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

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

  const statusLabel = (status?: string | null) => {
    if (status === "success") return language === "ru" ? "Успешно" : "Success";
    if (status === "failed") return language === "ru" ? "Не удалось" : "Failed";
    return language === "ru" ? "В ожидании" : "Pending";
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

        {loading || !data ? (
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm p-4 text-sm text-muted-foreground">
            Loading...
          </Card>
        ) : (
          <>
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm p-4 space-y-3">
              <div className="flex items-center gap-3">
                {streamer?.profile_image_url ? (
                  <img
                    src={streamer.profile_image_url}
                    alt={streamer.display_name}
                    className="h-14 w-14 rounded-full object-cover ring-2 ring-primary/30"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-full bg-secondary flex items-center justify-center text-lg font-bold text-muted-foreground">
                    {(streamer?.display_name || "S").charAt(0).toUpperCase()}
                  </div>
                )}
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
                    <Users className="h-3 w-3" />
                    {data.live.viewer_count.toLocaleString()}
                  </Badge>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Button asChild variant="secondary" className="h-10">
                  <a
                    href={streamer?.twitch_login ? `https://twitch.tv/${streamer.twitch_login}` : "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    {language === "ru" ? "Открыть Twitch" : "Open Twitch"}
                  </a>
                </Button>
                {isTracked ? (
                  <Button variant="ghost" className="h-10" onClick={handleUntrack} disabled={trackingBusy}>
                    {language === "ru" ? "Убрать из отслеж." : "Untrack"}
                  </Button>
                ) : (
                  <Button className="h-10" onClick={handleTrack} disabled={trackingBusy || !streamer?.twitch_login}>
                    {language === "ru" ? "В отслеживаемые" : "Track"}
                  </Button>
                )}
              </div>
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
                  {data.stats.stream_amount ? `₽${data.stats.stream_amount}` : "₽0"}
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
                  {language === "ru" ? "Всего призов" : "Total prizes"}
                </p>
                <p className="text-lg font-semibold text-foreground">{data.stats.total_prizes}</p>
              </Card>
            </div>

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
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{statusLabel(prize.delivery_status)}</p>
                        {prize.skin_price !== null && prize.skin_price !== undefined && (
                          <p className="text-sm font-medium text-foreground">₽{prize.skin_price}</p>
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
