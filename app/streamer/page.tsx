"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiGet, apiPost } from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type Streamer = { id: number; display_name: string } | null;
type EventRow = { event_key: string; enabled: boolean; updated_at?: string };

const EVENT_LABELS: Record<string, string> = {
  "dota.first_blood": "First Blood",
  "dota.double_kill": "Double Kill",
  "dota.triple_kill": "Triple Kill",
  "dota.rampage": "Rampage",
  "dota.pick_puck": "Pick Puck",
  "dota.pick_sf": "Pick Shadow Fiend",
  "dota.pick_lina": "Pick Lina",
  "dota.pick_void_spirit": "Pick Void Spirit",
};

export default function StreamerPage() {
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [streamer, setStreamer] = useState<Streamer>(null);
  const [events, setEvents] = useState<EventRow[]>([]);

  const refresh = async () => {
    setErr(null);
    setLoading(true);
    try {
      const r = await apiGet("/streamer/me");
      setStreamer(r.streamer);
      setEvents(r.events ?? []);
    } catch (e: any) {
      setErr(String(e?.message ?? e));
    } finally {
      setLoading(false);
    }
  };

  const becomeStreamer = async () => {
    setErr(null);
    try {
      // имя можно потом брать из /me, пока сделаем дефолт
      await apiPost("/streamer/me", { display_name: "Streamer" });
      await refresh();
    } catch (e: any) {
      setErr(String(e?.message ?? e));
    }
  };

  const toggleEvent = async (event_key: string, enabled: boolean) => {
    setErr(null);

    // optimistic UI
    setEvents((prev) => prev.map((x) => (x.event_key === event_key ? { ...x, enabled } : x)));

    try {
      await apiPost("/streamer/events", { event_key, enabled });
    } catch (e: any) {
      // rollback on error
      setEvents((prev) => prev.map((x) => (x.event_key === event_key ? { ...x, enabled: !enabled } : x)));
      setErr(String(e?.message ?? e));
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  return (
    <main className="min-h-screen bg-background pb-8">
      <div className="mx-auto max-w-md px-4 py-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-base font-semibold">Streamer cabinet</h1>
          <Link href="/" className="text-xs underline opacity-80">
            Back
          </Link>
        </div>

        <Card className="p-4 space-y-2">
          <div className="text-xs opacity-70">Backend: {loading ? "checking..." : err ? "ERROR" : "OK"}</div>
          {err && <div className="text-xs text-red-600 break-words">{err}</div>}

          {!loading && !streamer && (
            <div className="space-y-2">
              <div className="text-sm">You are not a streamer yet.</div>
              <Button onClick={becomeStreamer} className="w-full">
                Become streamer
              </Button>
              <div className="text-xs opacity-70">
                (Если получишь 401 — значит нет токена: залогинься на главной странице через Telegram login / Dev login.)
              </div>
            </div>
          )}

          {!loading && streamer && (
            <div className="space-y-3">
              <div className="text-sm">
                Streamer: <span className="font-medium">{streamer.display_name}</span> (id={streamer.id})
              </div>

              <div className="space-y-2">
                {events.map((e) => (
                  <div key={e.event_key} className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm truncate">{EVENT_LABELS[e.event_key] ?? e.event_key}</div>
                      <div className="text-xs opacity-60 truncate">{e.event_key}</div>
                    </div>

                    <label className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={e.enabled}
                        onChange={(ev) => toggleEvent(e.event_key, ev.target.checked)}
                      />
                      {e.enabled ? "ON" : "OFF"}
                    </label>
                  </div>
                ))}
              </div>

              <Button variant="outline" onClick={refresh} className="w-full">
                Refresh
              </Button>
            </div>
          )}
        </Card>
      </div>
    </main>
  );
}
