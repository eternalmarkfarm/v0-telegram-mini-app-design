"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Radio, Users } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/lib/i18n";
import { apiGet } from "@/lib/api";

interface LiveStreamer {
  id: number;
  twitch_login: string;
  twitch_display_name?: string;
  profile_image_url?: string;
  is_live: boolean;
  game_name?: string;
  title?: string;
  viewer_count: number;
  started_at?: string;
}

export default function LiveStreamersPage() {
  const { language } = useI18n();
  const [streamers, setStreamers] = useState<LiveStreamer[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const data = await apiGet("/streamers/live");
      setStreamers(data?.streamers ?? []);
    } catch (e) {
      console.error("Failed to fetch live streamers:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

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
            <h1 className="text-lg font-bold text-foreground">
              {language === "ru" ? "Сейчас стримят" : "Live streamers"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {language === "ru" ? "Выберите стримера" : "Pick a streamer"}
            </p>
          </div>
        </div>

        <Card className="border-border/50 bg-card/80 backdrop-blur-sm divide-y divide-border/50">
          {loading ? (
            <div className="flex items-center gap-3 p-4 text-muted-foreground">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 animate-pulse">
                <Radio className="h-5 w-5 text-destructive/70" />
              </div>
              <p className="text-sm">Loading...</p>
            </div>
          ) : streamers.length === 0 ? (
            <div className="flex items-center gap-3 p-4 text-muted-foreground">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                <Radio className="h-5 w-5 text-destructive/70" />
              </div>
              <p className="text-sm">{language === "ru" ? "Нет активных стримов" : "No active streams"}</p>
            </div>
          ) : (
            streamers.map((streamer) => (
              <Link
                key={streamer.id}
                href={`/streamer/${streamer.id}`}
                className="flex items-center gap-3 p-3 hover:bg-secondary/30 transition-colors"
              >
                <div className="relative">
                  {streamer.profile_image_url ? (
                    <img
                      src={streamer.profile_image_url}
                      alt={streamer.twitch_login}
                      className="h-12 w-12 rounded-full object-cover ring-2 ring-destructive"
                    />
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-[#9146ff] to-[#6441a5] flex items-center justify-center text-white font-bold text-sm ring-2 ring-destructive">
                      {streamer.twitch_login.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-destructive ring-2 ring-card animate-pulse" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {streamer.twitch_display_name || streamer.twitch_login}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {streamer.game_name || (language === "ru" ? "В эфире" : "Live")}
                  </p>
                </div>
                <Badge variant="secondary" className="bg-destructive/20 text-destructive border-0 flex items-center gap-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wide animate-pulse">Live</span>
                  <Users className="h-3 w-3" />
                  {streamer.viewer_count.toLocaleString()}
                </Badge>
              </Link>
            ))
          )}
        </Card>
      </div>
    </main>
  );
}
