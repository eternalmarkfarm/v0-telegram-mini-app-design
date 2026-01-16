"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Users, Trash2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/lib/i18n";
import { apiDelete, apiGet } from "@/lib/api";

type TrackedStreamer = {
  id: number;
  display_name?: string | null;
  twitch_login?: string | null;
  twitch_display_name?: string | null;
  profile_image_url?: string | null;
  is_live?: boolean;
};

export default function TrackedPage() {
  const { language } = useI18n();
  const [tracked, setTracked] = useState<TrackedStreamer[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const data = await apiGet("/viewer/tracked");
      setTracked(data?.streamers ?? []);
    } catch (e) {
      console.error("Failed to load tracked:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleRemove = async (streamerId: number) => {
    try {
      await apiDelete(`/viewer/tracked/${streamerId}`);
      setTracked((prev) => prev.filter((s) => s.id !== streamerId));
    } catch (e) {
      console.error("Failed to remove tracked:", e);
    }
  };

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
              {language === "ru" ? "Отслеживаемые" : "Tracked"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {language === "ru" ? "Ваш список стримеров" : "Your streamers list"}
            </p>
          </div>
        </div>

        <Card className="border-border/50 bg-card/80 backdrop-blur-sm divide-y divide-border/50">
          {loading ? (
            <div className="flex items-center gap-3 p-4 text-muted-foreground">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/40">
                <Users className="h-5 w-5 text-muted-foreground/70" />
              </div>
              <p className="text-sm">Loading...</p>
            </div>
          ) : tracked.length === 0 ? (
            <div className="flex items-center gap-3 p-4 text-muted-foreground">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/40">
                <Users className="h-5 w-5 text-muted-foreground/70" />
              </div>
              <p className="text-sm">{language === "ru" ? "Пока нет стримеров" : "No tracked streamers yet"}</p>
            </div>
          ) : (
            tracked.map((streamer) => {
              const name =
                streamer.twitch_display_name ||
                streamer.display_name ||
                streamer.twitch_login ||
                `#${streamer.id}`;
              return (
                <div key={streamer.id} className="p-3 flex items-center gap-3">
                  <Link href={`/streamer/${streamer.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                    {streamer.profile_image_url ? (
                      <img
                        src={streamer.profile_image_url}
                        alt={name}
                        className={`h-10 w-10 rounded-full object-cover ring-2 ${
                          streamer.is_live ? "ring-success" : "ring-border/50 opacity-70"
                        }`}
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground">
                        {name.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{name}</p>
                      <p className={`text-xs ${streamer.is_live ? "text-success" : "text-muted-foreground"}`}>
                        {streamer.is_live ? (language === "ru" ? "онлайн" : "online") : (language === "ru" ? "оффлайн" : "offline")}
                      </p>
                    </div>
                  </Link>
                  <Button size="icon" variant="ghost" onClick={() => handleRemove(streamer.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              );
            })
          )}
        </Card>
      </div>
    </main>
  );
}
