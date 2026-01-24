"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiGet } from "@/lib/api";
import { ensureAuth } from "@/lib/ensureAuth";
import { useI18n } from "@/lib/i18n";

type RangePoint = { date: string; count: number };
type StatsResponse = {
  has_data: boolean;
  ranges: {
    "5": RangePoint[];
    "15": RangePoint[];
    "30": RangePoint[];
  };
};

export default function StreamerFollowersPage() {
  const { t, language } = useI18n();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<StatsResponse | null>(null);

  const formatDay = (value: string) => {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;
    return date.toLocaleDateString(language === "ru" ? "ru-RU" : "en-US", {
      day: "2-digit",
      month: "short",
    });
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        await ensureAuth();
        const data = await apiGet("/streamer/followers/stats");
        setStats(data);
      } catch (e) {
        console.error("Failed to load followers stats:", e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const buildFallbackRange = (days: number): RangePoint[] => {
    const today = new Date();
    const list: RangePoint[] = [];
    for (let i = days - 1; i >= 0; i -= 1) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      list.push({ date: iso, count: 0 });
    }
    return list;
  };

  const renderRange = (days: "5" | "15" | "30", points: RangePoint[]) => {
    const safePoints = points.length ? points : buildFallbackRange(Number(days));
    const maxCount = Math.max(1, ...safePoints.map((p) => p.count));
    return (
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">
            {t.lastDays} {days}
          </p>
        </div>
        <div className="space-y-2 text-xs text-muted-foreground">
          {safePoints.map((p) => {
            const width = Math.round((p.count / maxCount) * 100);
            return (
              <div
                key={`${days}-${p.date}`}
                className="rounded-md bg-background/60 px-3 py-2"
              >
                <div className="flex items-center justify-between">
                  <span>{formatDay(p.date)}</span>
                  <span className="text-foreground font-medium">+{p.count}</span>
                </div>
                <div className="mt-2 h-2 w-full rounded-full bg-border/50">
                  <div
                    className="h-2 rounded-full bg-primary/70"
                    style={{ width: `${width}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/40 p-4 space-y-4">
      <div className="flex items-center justify-between">
        <Link href="/streamer" className="inline-flex items-center gap-2 text-sm text-muted-foreground">
          <ArrowLeft className="h-4 w-4" />
          {t.back}
        </Link>
        <h1 className="text-base font-semibold text-foreground">{t.followersDynamics}</h1>
        <div className="w-10" />
      </div>

      {loading ? (
        <Card className="border-border/50 bg-card/80 backdrop-blur-sm p-6 text-sm text-muted-foreground">
          …
        </Card>
      ) : (
        <div className="space-y-3">
          {!stats?.has_data && (
            <Card className="border-border/50 bg-card/80 backdrop-blur-sm p-4 text-xs text-muted-foreground">
              {t.notEnoughData}
            </Card>
          )}
          {renderRange("5", stats?.ranges?.["5"] || [])}
          {renderRange("15", stats?.ranges?.["15"] || [])}
          {renderRange("30", stats?.ranges?.["30"] || [])}
        </div>
      )}

      <Button variant="outline" className="w-full" asChild>
        <Link href="/streamer">{t.streamerDashboard}</Link>
      </Button>
    </div>
  );
}
