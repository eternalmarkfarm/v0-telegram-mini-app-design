"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle, XCircle, Clock, Heart, MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { apiGet } from "@/lib/api";
import { getEventLabel } from "@/lib/event-labels";

type PrizeItem = {
  id: number;
  skin_name?: string | null;
  skin_price?: number | null;
  delivery_status?: string | null;
  created_at?: string | null;
  event_key?: string | null;
  twitch_login?: string | null;
  trade_offer_expiry_at?: string | null;
};

export default function StreamerPrizesClient({ id }: { id?: string }) {
  const { language } = useI18n();
  const [items, setItems] = useState<PrizeItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [resolvedId, setResolvedId] = useState<string | null>(id ?? null);

  const pageSize = 15;

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
  const formatExpiry = (value?: string | null) => {
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

  const load = async (pageIndex: number) => {
    setLoading(true);
    try {
      if (!resolvedId) {
        throw new Error("Missing streamer id");
      }
      const offset = pageIndex * pageSize;
      const data = await apiGet(`/streamers/${resolvedId}/prizes?limit=${pageSize}&offset=${offset}`);
      setItems(data?.items ?? []);
      setTotal(data?.total ?? 0);
    } catch (e) {
      console.error("Failed to load prizes:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      setResolvedId(id);
      return;
    }
    if (typeof window === "undefined") return;
    const parts = window.location.pathname.split("/").filter(Boolean);
    const maybeId = parts[parts.length - 2];
    if (maybeId) {
      setResolvedId(maybeId);
    }
  }, [id]);

  useEffect(() => {
    if (!resolvedId) return;
    load(page);
  }, [resolvedId, page]);

  const statusLabel = (status?: string | null) => {
    if (status === "success") return language === "ru" ? "Получено" : "Received";
    if (status === "not_claimed") return language === "ru" ? "Не забрал" : "Not claimed";
    if (status === "sent") return language === "ru" ? "Отправлено" : "Sent";
    if (status === "failed") return language === "ru" ? "Не удалось" : "Failed";
    return language === "ru" ? "В обработке" : "Processing";
  };

  const statusClass = (status?: string | null) => {
    if (status === "success") return "text-success";
    if (status === "not_claimed" || status === "failed") return "text-destructive";
    if (status === "sent") return "text-amber-500 animate-pulse";
    return "text-sky-500";
  };

  const statusIconClass = (status?: string | null) => {
    if (status === "success") return "text-success";
    if (status === "not_claimed" || status === "failed") return "text-destructive";
    if (status === "sent") return "text-amber-500 animate-pulse";
    return "text-sky-500";
  };

  const maxPage = Math.max(0, Math.ceil(total / pageSize) - 1);

  return (
    <main className="min-h-screen bg-background pb-8">
      <div className="mx-auto max-w-md px-4 py-4 space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link href={`/streamer/${resolvedId ?? ""}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">
              {language === "ru" ? "Все выдачи" : "All prizes"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {language === "ru"
                ? "Требуется быть в чате Twitch для участия"
                : "You must be in Twitch chat to participate"}
            </p>
          </div>
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
                ? "Чтобы участвовать, нужно быть фоловером стримера и написать сообщение в чат (например, «привет»)."
                : "To participate you should follow the streamer and send a chat message (e.g. “hello”)."}
            </p>
            <div className="mt-2 inline-flex items-center gap-1 text-[11px] text-warning/90">
              <MessageCircle className="h-3.5 w-3.5" />
              {language === "ru" ? "Напишите в чат" : "Say hi in chat"}
            </div>
          </div>
        </Card>

        <Card className="border-border/50 bg-card/80 backdrop-blur-sm divide-y divide-border/50">
          {loading ? (
            <div className="p-4 text-sm text-muted-foreground">Loading...</div>
          ) : items.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">
              {language === "ru" ? "Пока нет выдач" : "No prizes yet"}
            </div>
          ) : (
            items.map((prize) => (
              <div key={prize.id} className="p-3 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary/60">
                  {prize.delivery_status === "success" ? (
                    <CheckCircle className={`h-4 w-4 ${statusIconClass(prize.delivery_status)}`} />
                  ) : prize.delivery_status === "not_claimed" || prize.delivery_status === "failed" ? (
                    <XCircle className={`h-4 w-4 ${statusIconClass(prize.delivery_status)}`} />
                  ) : (
                    <Clock className={`h-4 w-4 ${statusIconClass(prize.delivery_status)}`} />
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
                  {prize.trade_offer_expiry_at && (
                    <p className="text-[11px] text-muted-foreground">
                      {language === "ru"
                        ? "Трейд предложение активно до:"
                        : "Trade offer active until:"}{" "}
                      {formatExpiry(prize.trade_offer_expiry_at)}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  <p className={`text-xs ${statusClass(prize.delivery_status)}`}>
                    {statusLabel(prize.delivery_status)}
                  </p>
                  {prize.skin_price !== null && prize.skin_price !== undefined && (
                    <p className="text-sm font-medium text-foreground">${prize.skin_price}</p>
                  )}
                </div>
              </div>
            ))
          )}
        </Card>

        <div className="flex items-center justify-between">
          <Button
            variant="secondary"
            disabled={page === 0}
            onClick={() => setPage((prev) => Math.max(0, prev - 1))}
          >
            {language === "ru" ? "Назад" : "Back"}
          </Button>
          <p className="text-xs text-muted-foreground">
            {page + 1} / {maxPage + 1}
          </p>
          <Button
            variant="secondary"
            disabled={page >= maxPage}
            onClick={() => setPage((prev) => Math.min(maxPage, prev + 1))}
          >
            {language === "ru" ? "Вперед" : "Next"}
          </Button>
        </div>
      </div>
    </main>
  );
}
