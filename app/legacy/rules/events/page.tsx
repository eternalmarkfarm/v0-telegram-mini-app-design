"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { useI18n } from "@/lib/i18n"

const EVENTS = [
  { key: "dota.pick_puck", ru: "Пик Puck", en: "Pick Puck", once: true },
  { key: "dota.pick_sf", ru: "Пик Shadow Fiend", en: "Pick Shadow Fiend", once: true },
  { key: "dota.pick_lina", ru: "Пик Lina", en: "Pick Lina", once: true },
  { key: "dota.pick_void_spirit", ru: "Пик Void Spirit", en: "Pick Void Spirit", once: true },
  { key: "dota.first_blood", ru: "Первая кровь", en: "First Blood", once: true },
  { key: "dota.double_kill", ru: "Двойное убийство", en: "Double Kill", once: false },
  { key: "dota.triple_kill", ru: "Тройное убийство", en: "Triple Kill", once: false },
  { key: "dota.ultra_kill", ru: "Ультра убийство", en: "Ultra Kill", once: false },
  { key: "dota.rampage", ru: "Рампейдж", en: "Rampage", once: false },
  { key: "dota.kills_20", ru: "20 убийств", en: "20 Kills", once: true },
  { key: "dota.net_worth_10k_11", ru: "10к нетворс до 11 минуты", en: "Net worth 10k < 11m", once: true },
  { key: "dota.net_worth_20k", ru: "20к нетворс", en: "Net worth 20k", once: true },
  { key: "dota.net_worth_40k", ru: "40к нетворс", en: "Net worth 40k", once: true },
  { key: "dota.lh_minute_threshold", ru: "Крипы > 10×минута", en: "LH 10×minute", once: true },
  { key: "dota.two_hours", ru: "Игра 2 часа+", en: "Game 2 hours+", once: true },
  { key: "dota.buy_smoke", ru: "Купил смок", en: "Bought smoke", once: true },
  { key: "dota.aegis", ru: "Взял аегис", en: "Aegis", once: true },
  { key: "dota.cheese", ru: "Взял сыр", en: "Cheese", once: true },
  { key: "dota.roshan_banner", ru: "Взял знамя рошана", en: "Roshan banner", once: true },
  { key: "dota.refresher_shard", ru: "Взял рефрешер", en: "Refresher shard", once: true },
  { key: "dota.win_streak", ru: "Серия побед", en: "Win streak", once: true },
  { key: "dota.loss_streak", ru: "Серия поражений", en: "Loss streak", once: true },
]

export default function RulesEventsPage() {
  const { language } = useI18n()

  const frequencyLabel = (once: boolean) =>
    language === "ru"
      ? once
        ? "единожды за матч"
        : "каждое событие за матч"
      : once
        ? "once per match"
        : "every time per match"

  return (
    <main className="min-h-screen bg-background pb-8">
      <div className="mx-auto max-w-md px-4 py-4 space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link href="/rules">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-lg font-bold text-foreground">
              {language === "ru" ? "События для розыгрыша" : "Giveaway events"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {language === "ru"
                ? "Список игровых событий, которые могут запустить розыгрыш"
                : "Game events that can trigger a giveaway"}
            </p>
          </div>
        </div>

        <Card className="border-border/50 bg-card/80 backdrop-blur-sm divide-y divide-border/50">
          {EVENTS.map((event) => (
            <div key={event.key} className="p-3">
              <p className="text-sm font-semibold text-foreground">
                {language === "ru" ? event.ru : event.en}{" "}
                <span className="text-xs text-muted-foreground">
                  ({frequencyLabel(event.once)})
                </span>
              </p>
              <p className="text-[11px] text-muted-foreground">{event.key}</p>
            </div>
          ))}
        </Card>
      </div>
    </main>
  )
}
