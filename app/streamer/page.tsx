"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Gift,
  Trophy,
  Coins,
  Calendar,
  Send,
  CheckCircle,
  XCircle,
  Clock,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiGet, apiPost, removeToken, API_BASE, getToken } from "@/lib/api";
import { ensureAuth } from "@/lib/ensureAuth";
import { useI18n } from "@/lib/i18n";

type Streamer = {
  id: number;
  display_name: string;
  twitch_linked_at?: string | null;
  lis_skins_token_set?: boolean;
} | null;

function TwitchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
    </svg>
  );
}


export default function StreamerDashboard() {
  const { t, language } = useI18n();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [linking, setLinking] = useState(false);

  const [streamer, setStreamer] = useState<Streamer>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [lisTokenInput, setLisTokenInput] = useState("");
  const [lisTokenSaving, setLisTokenSaving] = useState(false);
  const [lisTokenSaved, setLisTokenSaved] = useState(false);
  const [summary, setSummary] = useState<any>(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const twitchAuthUrlRef = useRef<string | null>(null);
  const [twitchAuthReady, setTwitchAuthReady] = useState(false);
  const [twitchAuthLoading, setTwitchAuthLoading] = useState(false);
  const [twitchDisconnectNote, setTwitchDisconnectNote] = useState(false);

  const refresh = async () => {
    setErr(null);
    setLoading(true);
    try {
      await ensureAuth();
      const r = await apiGet("/streamer/me");
      setStreamer(r.streamer);
      setLisTokenSaved(Boolean(r.streamer?.lis_skins_token_set));
    } catch (e: any) {
      setErr(String(e?.message ?? e));
    } finally {
      setLoading(false);
    }
  };

  const becomeStreamer = async () => {
    setErr(null);
    try {
      await ensureAuth();
      await apiPost("/streamer/me", { display_name: "Streamer" });
      await refresh();
    } catch (e: any) {
      setErr(String(e?.message ?? e));
    }
  };


  const confirmDeleteCabinet = () => {
    const confirmText =
      language === "ru"
        ? "Удалить кабинет стримера и все его настройки?"
        : "Delete streamer cabinet and all its settings?";
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.showPopup) {
      return new Promise<boolean>((resolve) => {
        tg.showPopup(
          {
            title: language === "ru" ? "Подтверждение" : "Confirm",
            message: confirmText,
            buttons: [
              { id: "cancel", type: "cancel", text: language === "ru" ? "Отмена" : "Cancel" },
              {
                id: "delete",
                type: "destructive",
                text: language === "ru" ? "Удалить" : "Delete",
              },
            ],
          },
          (buttonId: string) => resolve(buttonId === "delete"),
        );
      });
    }

    return Promise.resolve(window.confirm(confirmText));
  };

  const handleDeleteAccount = async () => {
    const confirmed = await confirmDeleteCabinet();
    if (!confirmed) return;
    setDeleteLoading(true);
    setErr(null);
    try {
      await ensureAuth();
      await apiPost("/streamer/delete");
      setStreamer(null);
      setLinking(false);
      setTwitchAuthReady(false);
      setTwitchAuthLoading(false);
      twitchAuthUrlRef.current = null;
      setTwitchDisconnectNote(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (e: any) {
      const message = String(e?.message ?? e);
      const isAuthError =
        message.includes("Session invalid/expired") ||
        message.includes("Missing Bearer token") ||
        message.includes("401");
      if (isAuthError) {
        removeToken();
        try {
          await ensureAuth();
          await apiPost("/streamer/delete");
          setStreamer(null);
          setLinking(false);
          setTwitchAuthReady(false);
          setTwitchAuthLoading(false);
          twitchAuthUrlRef.current = null;
          setTwitchDisconnectNote(true);
          window.scrollTo({ top: 0, behavior: "smooth" });
          return;
        } catch (retryErr: any) {
          const m = String(retryErr?.message ?? retryErr);
          setErr(m);
          const tg = (window as any).Telegram?.WebApp;
          tg?.showAlert?.(m);
        }
      } else {
        setErr(message);
        const tg = (window as any).Telegram?.WebApp;
        tg?.showAlert?.(message);
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  const loadSummary = async (streamerId: number) => {
    setSummaryLoading(true);
    try {
      const data = await apiGet(`/streamers/${streamerId}`);
      setSummary(data);
    } catch (e) {
      console.error("Failed to load streamer summary:", e);
    } finally {
      setSummaryLoading(false);
    }
  };

  const saveLisToken = async () => {
    if (!lisTokenInput.trim()) return;
    setErr(null);
    setLisTokenSaving(true);
    try {
      await ensureAuth();
      await apiPost("/streamer/lis-skins-token", { api_token: lisTokenInput.trim() });
      setLisTokenInput("");
      setLisTokenSaved(true);
    } catch (e: any) {
      setErr(String(e?.message ?? e));
    } finally {
      setLisTokenSaving(false);
    }
  };

  const handleDownloadConfig = async () => {
    setErr(null);
    try {
      await ensureAuth();
      const token = getToken();
      if (!token) throw new Error("Missing auth token");
      const resp = await fetch(`${API_BASE}/streamer/gsi-config`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!resp.ok) throw new Error(await resp.text());
      const text = await resp.text();
      const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "gamestate_integration_drop.cfg";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      setErr(String(e?.message ?? e));
    }
  };

  const startTwitchLink = () => {
    setErr(null);
    const cachedUrl = twitchAuthUrlRef.current;
    if (!cachedUrl) return;
    setLinking(true);
    const tg = (window as any).Telegram?.WebApp;
    if (tg?.openLink) {
      tg.openLink(cachedUrl);
    } else {
      window.location.href = cachedUrl;
    }
  };

  useEffect(() => {
    refresh();
    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (streamer?.id) {
      loadSummary(streamer.id);
    }
  }, [streamer?.id]);

  useEffect(() => {
    if (!streamer) {
      setTwitchAuthReady(false);
      setTwitchAuthLoading(false);
      twitchAuthUrlRef.current = null;
    }
  }, [streamer]);

  useEffect(() => {
    if (!streamer || streamer?.twitch_linked_at) return;
    let cancelled = false;
    const prefetch = async () => {
      setTwitchAuthLoading(true);
      try {
        await ensureAuth();
        const r = await apiGet("/twitch/authorize");
        const url = r?.url ?? r;
        if (url && !cancelled) {
          twitchAuthUrlRef.current = url;
          setTwitchAuthReady(true);
        }
      } catch (e) {
        console.warn("Twitch prefetch failed:", e);
        if (!cancelled) setTwitchAuthReady(false);
      } finally {
        if (!cancelled) setTwitchAuthLoading(false);
      }
    };
    prefetch();
    return () => {
      cancelled = true;
    };
  }, [streamer?.id, streamer?.twitch_linked_at]);

  // Polling для проверки статуса привязки Twitch
  useEffect(() => {
    if (linking) {
      pollingRef.current = setInterval(async () => {
        try {
          await ensureAuth();
          const r = await apiGet("/streamer/me");
          if (r.streamer?.twitch_linked_at) {
            setStreamer(r.streamer);
            setLinking(false);
            if (pollingRef.current) {
              clearInterval(pollingRef.current);
              pollingRef.current = null;
            }
          }
        } catch (e) {
          console.error("Polling error:", e);
        }
      }, 3000);
    }

    return () => {
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, [linking]);

  const twitchLinked = Boolean(streamer?.twitch_linked_at);

  return (
    <main className="min-h-screen bg-background pb-8">
      <div className="mx-auto max-w-md px-4 py-4 space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-foreground">{t.streamerDashboard}</h1>
            <p className="text-xs text-muted-foreground">
              {language === "ru" ? "Управление стримом" : "Stream management"}
            </p>
          </div>
          {twitchLinked && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#9146ff]/20">
              <TwitchIcon className="h-4 w-4 text-[#9146ff]" />
              <span className="text-xs font-medium text-[#9146ff]">
                {language === "ru" ? "Подключен" : "Connected"}
              </span>
            </div>
          )}
        </div>
        {twitchDisconnectNote && (
          <div className="rounded-xl border border-amber-400/30 bg-amber-500/15 px-3 py-2 text-sm text-amber-100">
            {language === "ru"
              ? "Токен отозван. Чтобы убрать приложение из списка подключений Twitch, отключите его вручную в настройках Twitch."
              : "Token revoked. To remove the app from Twitch Connections, disconnect it manually in Twitch settings."}
          </div>
        )}

        {typeof window !== "undefined" && new URLSearchParams(window.location.search).get("debug") === "1" && (
          <div className="text-xs opacity-70">
            Backend: {loading ? "checking..." : err ? "ERROR" : "OK"}
            {err && <div className="text-xs text-red-600 break-words">{err}</div>}
          </div>
        )}

        {!loading && (!streamer || (streamer && !twitchLinked)) && (
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm overflow-hidden">
            <div className="bg-gradient-to-br from-[#9146ff]/20 to-[#9146ff]/5 p-6 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#9146ff]/20 mx-auto mb-4">
                <TwitchIcon className="h-10 w-10 text-[#9146ff]" />
              </div>
              <h2 className="text-xl font-bold text-foreground mb-2">
                {language === "ru" ? "Станьте стримером" : "Become a Streamer"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {language === "ru"
                  ? "Привяжите Twitch аккаунт, чтобы получить доступ к личному кабинету стримера"
                  : "Link your Twitch account to access the streamer dashboard"}
              </p>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20">
                  <Gift className="h-4 w-4 text-primary" />
                </div>
                <p className="text-sm text-foreground">
                  {language === "ru" ? "Автоматические розыгрыши на стриме" : "Automatic giveaways on stream"}
                </p>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/20">
                  <Trophy className="h-4 w-4 text-success" />
                </div>
                <p className="text-sm text-foreground">
                  {language === "ru" ? "Настройка событий для розыгрышей" : "Configure events for giveaways"}
                </p>
              </div>
              <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-warning/20">
                  <Coins className="h-4 w-4 text-warning" />
                </div>
                <p className="text-sm text-foreground">
                  {language === "ru" ? "Статистика и история отправок" : "Statistics and sending history"}
                </p>
              </div>
            </div>

            <div className="p-4 pt-0">
              {streamer ? (
                <Button
                  className="w-full h-12 text-base font-medium bg-[#9146ff] hover:bg-[#7c3aed] text-white"
                  onClick={startTwitchLink}
                  disabled={linking || twitchAuthLoading || !twitchAuthReady}
                  type="button"
                >
                  <TwitchIcon className="h-5 w-5 mr-2" />
                  {linking
                    ? "Redirecting..."
                    : twitchAuthLoading || !twitchAuthReady
                      ? language === "ru"
                        ? "Подготовка..."
                        : "Preparing..."
                      : language === "ru"
                        ? "Привязать Twitch"
                        : "Link Twitch"}
                </Button>
              ) : (
                <Button
                  className="w-full h-12 text-base font-medium bg-[#9146ff] hover:bg-[#7c3aed] text-white"
                  onClick={becomeStreamer}
                  disabled={linking}
                  type="button"
                >
                  <TwitchIcon className="h-5 w-5 mr-2" />
                  {language === "ru" ? "Стать стримером" : "Become Streamer"}
                </Button>
              )}
            </div>
          </Card>
        )}

        {!loading && streamer && twitchLinked && (
          <>
            <div>
              <h2 className="text-sm font-medium text-muted-foreground mb-3 px-1">{t.yourStatistics}</h2>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    icon: Trophy,
                    label: language === "ru" ? "Выдано всего" : "Total prizes",
                    value: summary?.stats?.total_prizes ?? 0,
                    color: "text-warning",
                    bg: "bg-warning/20",
                  },
                  {
                    icon: Coins,
                    label: language === "ru" ? "Сумма всего" : "Total amount",
                    value: `₽${summary?.stats?.total_amount ?? 0}`,
                    color: "text-success",
                    bg: "bg-success/20",
                  },
                  {
                    icon: Calendar,
                    label: language === "ru" ? "За стрим" : "This stream",
                    value: summary?.stats?.stream_prizes ?? 0,
                    color: "text-primary",
                    bg: "bg-primary/20",
                  },
                  {
                    icon: Gift,
                    label: language === "ru" ? "Участников" : "Participants",
                    value: summary?.stats?.stream_participants ?? 0,
                    color: "text-accent",
                    bg: "bg-accent/20",
                  },
                ].map((stat) => (
                  <Card key={stat.label} className="border-border/50 bg-card/80 backdrop-blur-sm p-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}>
                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                      </div>
                      <div>
                        <p className="text-lg font-bold text-foreground">
                          {summaryLoading ? "…" : stat.value}
                        </p>
                        <p className="text-xs text-muted-foreground">{stat.label}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-sm font-medium text-muted-foreground mb-3 px-1">{t.sentSkins}</h2>
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm divide-y divide-border/50">
                {summary?.recent_prizes?.length ? (
                  summary.recent_prizes.map((prize: any) => (
                    <div key={prize.id} className="p-3 flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary/60">
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
                          {prize.twitch_login ? `@${prize.twitch_login}` : t.recipient}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">
                          {prize.delivery_status === "success"
                            ? language === "ru"
                              ? "Успешно"
                              : "Success"
                            : prize.delivery_status === "failed"
                              ? language === "ru"
                                ? "Не удалось"
                                : "Failed"
                              : language === "ru"
                                ? "В ожидании"
                                : "Pending"}
                        </p>
                        {prize.skin_price !== null && prize.skin_price !== undefined && (
                          <p className="text-sm font-medium text-foreground">₽{prize.skin_price}</p>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <Send className="h-10 w-10 text-muted-foreground/50 mb-2" />
                    <p className="text-sm text-muted-foreground">{t.noSentSkins}</p>
                  </div>
                )}
                {summary?.streamer?.id && (
                  <Button variant="ghost" className="w-full justify-center py-3 text-primary hover:bg-primary/10" asChild>
                    <Link href={`/streamer/${summary.streamer.id}/prizes`}>
                      {language === "ru" ? "Показать все" : "Show all"}
                      <ChevronRight className="h-4 w-4 ml-1" />
                    </Link>
                  </Button>
                )}
              </Card>
            </div>

            <Button
              variant="outline"
              className="w-full h-12 text-base font-medium justify-between"
              asChild
            >
              <Link href="/streamer/events">
                <span className="flex items-center gap-2">
                  <Gift className="h-5 w-5 text-primary" />
                  {language === "ru" ? "Настройка событий" : "Events settings"}
                </span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Link>
            </Button>

            <div>
              <h2 className="text-sm font-medium text-muted-foreground mb-3 px-1">
                {language === "ru" ? "Токен Lis-Skins" : "Lis-Skins Token"}
              </h2>
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm p-4 space-y-3">
                <input
                  type="password"
                  value={lisTokenInput}
                  onChange={(e) => setLisTokenInput(e.target.value)}
                  placeholder={language === "ru" ? "Вставьте API токен" : "Paste API token"}
                  className="w-full rounded-md border border-border bg-input/40 px-3 py-2 text-sm text-foreground"
                />
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {lisTokenSaved
                      ? language === "ru"
                        ? "Токен сохранен"
                        : "Token saved"
                      : language === "ru"
                        ? "Токен не задан"
                        : "Token not set"}
                  </p>
                  <Button
                    onClick={saveLisToken}
                    disabled={lisTokenSaving || !lisTokenInput.trim()}
                    className="h-9 px-4"
                  >
                    {lisTokenSaving
                      ? language === "ru"
                        ? "Сохранение..."
                        : "Saving..."
                      : language === "ru"
                        ? "Сохранить"
                        : "Save"}
                  </Button>
                </div>
              </Card>
            </div>

            <Button
              className="w-full h-14 text-base font-medium bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
              onClick={handleDownloadConfig}
            >
              <Download className="h-5 w-5 mr-2" />
              {t.downloadConfig}
            </Button>

            <Button
              variant="destructive"
              className="w-full h-12 text-base font-medium"
              onClick={handleDeleteAccount}
              disabled={deleteLoading}
              type="button"
            >
              <Trash2 className="h-5 w-5 mr-2" />
              {deleteLoading
                ? language === "ru"
                  ? "Удаление..."
                  : "Deleting..."
                : language === "ru"
                  ? "Удалить кабинет стримера"
                  : "Delete streamer cabinet"}
            </Button>
            {err && (
              <p className="text-xs text-red-500 text-center">{err}</p>
            )}
          </>
        )}
      </div>
    </main>
  );
}
