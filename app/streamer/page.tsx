"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Gift,
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

  const refresh = async () => {
    setErr(null);
    setLoading(true);
    try {
      await ensureAuth();
      const r = await apiGet("/streamer/me");
      setStreamer(r.streamer);
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


  const handleDeleteAccount = async () => {
    const confirmText =
      language === "ru"
        ? "Точно удалить аккаунт и все данные (кроме Telegram)?"
        : "Delete account and all data (except Telegram) ?";
    if (!window.confirm(confirmText)) return;
    setDeleteLoading(true);
    setErr(null);
    try {
      await ensureAuth();
      await apiPost("/account/delete");
      removeToken();
      window.location.href = "/";
    } catch (e: any) {
      setErr(String(e?.message ?? e));
    } finally {
      setDeleteLoading(false);
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

  const startTwitchLink = async () => {
    setErr(null);
    setLinking(true);
    try {
      await ensureAuth();
      const r = await apiGet("/twitch/authorize");
      const url = r?.url ?? r;
      if (!url) throw new Error("No Twitch authorize URL.");

      const tg = (window as any).Telegram?.WebApp;
      if (tg?.openLink) {
        tg.openLink(url);
      } else {
        window.location.href = url;
      }
    } catch (e: any) {
      setErr(String(e?.message ?? e));
      setLinking(false);
    }
  };

  useEffect(() => {
    refresh();

    // Refresh when returning from external browser
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
    };
  }, []);

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
                  disabled={linking}
                >
                  <TwitchIcon className="h-5 w-5 mr-2" />
                  {linking ? "Redirecting..." : language === "ru" ? "Привязать Twitch" : "Link Twitch"}
                </Button>
              ) : (
                <Button
                  className="w-full h-12 text-base font-medium bg-[#9146ff] hover:bg-[#7c3aed] text-white"
                  onClick={becomeStreamer}
                  disabled={linking}
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
            <Link href="/streamer/events">
              <Card className="border-border/50 bg-card/80 backdrop-blur-sm p-4 flex items-center justify-between hover:bg-secondary/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                    <Gift className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {language === "ru" ? "Настройка событий" : "Events settings"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {language === "ru" ? "Цены, победители и токены" : "Prices, winners and tokens"}
                    </p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Card>
            </Link>

            <Button
              className="w-full h-14 text-base font-medium bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
              onClick={handleDownloadConfig}
            >
              <Download className="h-5 w-5 mr-2" />
              {t.downloadConfig}
            </Button>

            <Button
              variant="ghost"
              className="w-full h-12 text-base font-medium text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={handleDeleteAccount}
              disabled={deleteLoading}
            >
              <Trash2 className="h-5 w-5 mr-2" />
              {deleteLoading
                ? language === "ru"
                  ? "Удаление..."
                  : "Deleting..."
                : language === "ru"
                  ? "Удалить аккаунт"
                  : "Delete account"}
            </Button>
          </>
        )}
      </div>
    </main>
  );
}
