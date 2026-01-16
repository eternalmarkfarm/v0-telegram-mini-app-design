"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Gift } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { apiGet, apiPost } from "@/lib/api";
import { ensureAuth } from "@/lib/ensureAuth";
import { useI18n } from "@/lib/i18n";

type EventRow = {
  event_key: string;
  enabled: boolean;
  updated_at?: string;
  price_min?: number | null;
  price_max?: number | null;
  winners_count?: number | null;
};

const EVENT_META: Record<string, { label: string; descRu: string; descEn: string }> = {
  "dota.pick_puck": {
    label: "Pick Puck",
    descRu: "Выбор Puck",
    descEn: "Pick Puck",
  },
  "dota.pick_sf": {
    label: "Pick Shadow Fiend",
    descRu: "Выбор Shadow Fiend",
    descEn: "Pick Shadow Fiend",
  },
  "dota.pick_lina": {
    label: "Pick Lina",
    descRu: "Выбор Lina",
    descEn: "Pick Lina",
  },
  "dota.pick_void_spirit": {
    label: "Pick Void Spirit",
    descRu: "Выбор Void Spirit",
    descEn: "Pick Void Spirit",
  },
  "dota.first_blood": {
    label: "First Blood",
    descRu: "Первая кровь",
    descEn: "First blood",
  },
  "dota.double_kill": {
    label: "Double Kill",
    descRu: "Двойное убийство",
    descEn: "Double kill",
  },
  "dota.triple_kill": {
    label: "Triple Kill",
    descRu: "Тройное убийство",
    descEn: "Triple kill",
  },
  "dota.rampage": {
    label: "Rampage",
    descRu: "Рампейдж",
    descEn: "Rampage",
  },
};

export default function StreamerEventsPage() {
  const { language } = useI18n();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [lisTokenInput, setLisTokenInput] = useState("");
  const [lisTokenSaving, setLisTokenSaving] = useState(false);
  const [lisTokenSaved, setLisTokenSaved] = useState(false);

  const refresh = async () => {
    setErr(null);
    setLoading(true);
    try {
      await ensureAuth();
      const r = await apiGet("/streamer/me");
      setEvents(r.events ?? []);
      setLisTokenSaved(Boolean(r.streamer?.lis_skins_token_set));
    } catch (e: any) {
      setErr(String(e?.message ?? e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refresh();
  }, []);

  const eventItems = useMemo(
    () =>
      events.map((event) => ({
        ...event,
        meta: EVENT_META[event.event_key],
      })),
    [events],
  );

  const toggleEvent = async (event_key: string, enabled: boolean) => {
    setErr(null);
    setEvents((prev) => prev.map((x) => (x.event_key === event_key ? { ...x, enabled } : x)));
    try {
      await ensureAuth();
      await apiPost("/streamer/events", { event_key, enabled });
    } catch (e: any) {
      setEvents((prev) => prev.map((x) => (x.event_key === event_key ? { ...x, enabled: !enabled } : x)));
      setErr(String(e?.message ?? e));
    }
  };

  const updateEventField = (event_key: string, field: keyof EventRow, value: number | null) => {
    setEvents((prev) =>
      prev.map((x) => (x.event_key === event_key ? { ...x, [field]: value } : x))
    );
  };

  const saveEventConfig = async (event: EventRow) => {
    setErr(null);
    try {
      await ensureAuth();
      await apiPost("/streamer/events", {
        event_key: event.event_key,
        price_min: event.price_min,
        price_max: event.price_max,
        winners_count: event.winners_count,
      });
    } catch (e: any) {
      setErr(String(e?.message ?? e));
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

  return (
    <main className="min-h-screen bg-background pb-8">
      <div className="mx-auto max-w-md px-4 py-4 space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link href="/streamer">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-lg font-bold text-foreground">
              {language === "ru" ? "Настройка событий" : "Events settings"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {language === "ru" ? "Цены, победители и токены" : "Prices, winners and tokens"}
            </p>
          </div>
        </div>

        {err && <div className="text-xs text-red-500">{err}</div>}

        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3 px-1">
            {language === "ru" ? "События розыгрышей" : "Giveaway events"}
          </h2>
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <div className="divide-y divide-border/50">
              {loading ? (
                <div className="p-4 text-sm text-muted-foreground">Loading...</div>
              ) : eventItems.length === 0 ? (
                <div className="p-4 text-sm text-muted-foreground">No events yet.</div>
              ) : (
                eventItems.map((event) => (
                  <div key={event.event_key} className="p-3 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">
                          {event.meta?.label ?? event.event_key}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {language === "ru"
                            ? event.meta?.descRu ?? event.event_key
                            : event.meta?.descEn ?? event.event_key}
                        </p>
                      </div>
                      <Switch
                        checked={event.enabled}
                        onCheckedChange={(checked) => toggleEvent(event.event_key, checked)}
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={event.price_min ?? ""}
                        onChange={(e) =>
                          updateEventField(
                            event.event_key,
                            "price_min",
                            e.target.value === "" ? null : Number(e.target.value)
                          )
                        }
                        placeholder={language === "ru" ? "Цена от" : "Min price"}
                        className="h-9 no-spin"
                      />
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={event.price_max ?? ""}
                        onChange={(e) =>
                          updateEventField(
                            event.event_key,
                            "price_max",
                            e.target.value === "" ? null : Number(e.target.value)
                          )
                        }
                        placeholder={language === "ru" ? "Цена до" : "Max price"}
                        className="h-9 no-spin"
                      />
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        value={event.winners_count ?? ""}
                        onChange={(e) =>
                          updateEventField(
                            event.event_key,
                            "winners_count",
                            e.target.value === "" ? null : Number(e.target.value)
                          )
                        }
                        placeholder={language === "ru" ? "Победители" : "Winners"}
                        className="h-9 no-spin"
                      />
                    </div>
                    <div className="flex justify-end">
                      <Button
                        variant="secondary"
                        className="h-8 px-3 text-xs"
                        onClick={() => saveEventConfig(event)}
                      >
                        {language === "ru" ? "Сохранить" : "Save"}
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3 px-1">
            {language === "ru" ? "Токен Lis-Skins" : "Lis-Skins Token"}
          </h2>
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm p-4 space-y-3">
            <Input
              type="password"
              value={lisTokenInput}
              onChange={(e) => setLisTokenInput(e.target.value)}
              placeholder={language === "ru" ? "Вставьте API токен" : "Paste API token"}
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
      </div>
    </main>
  );
}
