"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Download, Trophy, Coins, Calendar, Gift, Send, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useI18n } from "@/lib/i18n"

// Event configuration list with translations
const eventsList = [
  { id: "pick_hero", label: "Pick HERO", descRu: "Выбор героя", descEn: "Hero picked" },
  { id: "first_blood", label: "First BLOOD", descRu: "Первая кровь", descEn: "First blood" },
  { id: "double_kill", label: "Double Kill", descRu: "Двойное убийство", descEn: "Double kill" },
  { id: "triple_kill", label: "Triple Kill", descRu: "Тройное убийство", descEn: "Triple kill" },
  { id: "ultra_kill", label: "Ultra Kill", descRu: "Ультра-убийство", descEn: "Ultra kill" },
  { id: "rampage", label: "Rampage", descRu: "Рампейдж", descEn: "Rampage" },
  { id: "lh_creeps", label: "10 L/H CREEPS", descRu: "10 ластхитов крипов", descEn: "10 last hit creeps" },
  {
    id: "networth_11m",
    label: "10k networth till 11m",
    descRu: "10к нетворса до 11 минуты",
    descEn: "10k networth by 11 min",
  },
  { id: "networth_40k", label: "40k networth in game", descRu: "40к нетворса в игре", descEn: "40k networth in game" },
  { id: "kills_20", label: "20 kills", descRu: "20 убийств", descEn: "20 kills" },
  { id: "zero_death", label: "0 death in game", descRu: "0 смертей за игру", descEn: "0 deaths in game" },
  { id: "assists_40", label: "40 assists in game", descRu: "40 ассистов за игру", descEn: "40 assists in game" },
  { id: "game_20m", label: "time of game < 20m", descRu: "Игра меньше 20 минут", descEn: "Game under 20 min" },
  { id: "game_15m", label: "time of game < 15m", descRu: "Игра меньше 15 минут", descEn: "Game under 15 min" },
  { id: "game_10m", label: "time of game < 10m", descRu: "Игра меньше 10 минут", descEn: "Game under 10 min" },
  { id: "game_2h", label: "time of game > 2h", descRu: "Игра больше 2 часов", descEn: "Game over 2 hours" },
]

// Sent skins history
const sentSkins = [
  { id: 1, skin: "AK-47 | Redline", recipient: "player123", date: { ru: "10 янв", en: "Jan 10" }, value: "₽2,340" },
  { id: 2, skin: "AWP | Asiimov", recipient: "steam_user", date: { ru: "9 янв", en: "Jan 9" }, value: "₽4,120" },
  { id: 3, skin: "M4A4 | Howl", recipient: "dota_fan", date: { ru: "8 янв", en: "Jan 8" }, value: "₽12,500" },
  { id: 4, skin: "Knife | Doppler", recipient: "lucky_one", date: { ru: "7 янв", en: "Jan 7" }, value: "₽8,900" },
]

export default function StreamerDashboard() {
  const { t, language } = useI18n()

  const [events, setEvents] = useState<Record<string, boolean>>(() => {
    return eventsList.reduce(
      (acc, event) => {
        acc[event.id] = true
        return acc
      },
      {} as Record<string, boolean>,
    )
  })

  const toggleEvent = (eventId: string) => {
    setEvents((prev) => ({ ...prev, [eventId]: !prev[eventId] }))
  }

  // Personal statistics with translations
  const personalStats = [
    {
      icon: Trophy,
      label: language === "ru" ? "Моих призов" : "My prizes",
      value: "47",
      color: "text-warning",
      bg: "bg-warning/20",
    },
    {
      icon: Coins,
      label: language === "ru" ? "Разыграно" : "Given away",
      value: "₽23.5K",
      color: "text-success",
      bg: "bg-success/20",
    },
    { icon: Calendar, label: t.monthlyAmount, value: "₽8.2K", color: "text-primary", bg: "bg-primary/20" },
    {
      icon: Gift,
      label: language === "ru" ? "Активных" : "Active",
      value: "3",
      color: "text-accent",
      bg: "bg-accent/20",
    },
  ]

  return (
    <main className="min-h-screen bg-background pb-8">
      <div className="mx-auto max-w-md px-4 py-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-lg font-bold text-foreground">{t.streamerDashboard}</h1>
            <p className="text-xs text-muted-foreground">
              {language === "ru" ? "Управление стримом" : "Stream management"}
            </p>
          </div>
        </div>

        {/* Personal Statistics */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3 px-1">{t.yourStatistics}</h2>
          <div className="grid grid-cols-2 gap-3">
            {personalStats.map((stat) => (
              <Card key={stat.label} className="border-border/50 bg-card/80 backdrop-blur-sm p-4">
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-lg font-bold text-foreground">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Sent Skins History */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3 px-1">{t.sentSkins}</h2>
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm divide-y divide-border/50">
            {sentSkins.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <Send className="h-10 w-10 text-muted-foreground/50 mb-2" />
                <p className="text-sm text-muted-foreground">{t.noSentSkins}</p>
              </div>
            ) : (
              <>
                {sentSkins.map((skin) => (
                  <div key={skin.id} className="p-3 flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                      <Send className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{skin.skin}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.recipient}: {skin.recipient}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-success">{skin.value}</p>
                      <p className="text-xs text-muted-foreground">{skin.date[language]}</p>
                    </div>
                  </div>
                ))}
                <Button variant="ghost" className="w-full justify-center py-3 text-primary hover:bg-primary/10">
                  {language === "ru" ? "Показать все" : "Show all"}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </>
            )}
          </Card>
        </div>

        {/* Events Configuration */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3 px-1">{t.eventsSettings}</h2>
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
            <div className="divide-y divide-border/50">
              {eventsList.map((event) => (
                <div key={event.id} className="p-3 flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{event.label}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {language === "ru" ? event.descRu : event.descEn}
                    </p>
                  </div>
                  <Switch
                    checked={events[event.id]}
                    onCheckedChange={() => toggleEvent(event.id)}
                    className="data-[state=checked]:bg-primary"
                  />
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Download Config Button */}
        <Button className="w-full h-14 text-base font-medium bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity">
          <Download className="h-5 w-5 mr-2" />
          {t.downloadConfig}
        </Button>
      </div>
    </main>
  )
}
