"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Gift, ChevronRight } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { apiGet } from "@/lib/api"
import { getEventLabel } from "@/lib/event-labels"

type RecentPrize = {
  id: number
  skin_name?: string | null
  skin_price?: number | null
  created_at?: string | null
  event_key?: string | null
  winner_twitch_login?: string | null
  streamer?: {
    display_name?: string | null
    twitch_login?: string | null
  }
}

export function RecentPrizes() {
  const { language } = useI18n()
  const [items, setItems] = useState<RecentPrize[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      const data = await apiGet("/public/recent-prizes?limit=3")
      setItems(data?.items ?? [])
    } catch (e) {
      console.error("Failed to load recent prizes:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [])

  const formatDate = (value?: string | null) => {
    if (!value) return null
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return null
    return date.toLocaleString(language === "ru" ? "ru-RU" : "en-US", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3 px-1">
        <Gift className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-medium text-muted-foreground">
          {language === "ru" ? "Последние разыгранные призы" : "Latest prizes"}
        </h2>
      </div>
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm divide-y divide-border/50">
        {loading ? (
          <div className="p-4 text-sm text-muted-foreground">Loading...</div>
        ) : items.length === 0 ? (
          <div className="p-4 text-sm text-muted-foreground">
            {language === "ru" ? "Пока нет выдач" : "No prizes yet"}
          </div>
        ) : (
          items.map((prize) => {
            const streamerLabel = prize.streamer?.twitch_login
              ? `@${prize.streamer.twitch_login}`
              : prize.streamer?.display_name || (language === "ru" ? "Стример" : "Streamer")
            const twitchLink = prize.streamer?.twitch_login
              ? `https://twitch.tv/${prize.streamer.twitch_login}`
              : null
            return (
              <div key={prize.id} className="p-3 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-secondary/60">
                  <Gift className="h-4 w-4 text-green-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-fuchsia-500 truncate">
                    {prize.skin_name || (language === "ru" ? "Скин" : "Skin")}
                  </p>
                  {prize.winner_twitch_login && (
                    <p className="text-xs text-green-500">
                      {language === "ru" ? "Победитель:" : "Winner:"} @{prize.winner_twitch_login}
                    </p>
                  )}
                  {twitchLink ? (
                    <a
                      href={twitchLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#9146ff] hover:underline"
                    >
                      {streamerLabel}
                    </a>
                  ) : (
                    <p className="text-xs text-muted-foreground">{streamerLabel}</p>
                  )}
                  {prize.event_key && (
                    <p className="text-[11px]">
                      <span className="text-foreground">
                        {language === "ru" ? "Событие:" : "Event:"}
                      </span>{" "}
                      <span className="text-[#a855f7]">{getEventLabel(prize.event_key, language)}</span>
                    </p>
                  )}
                  {prize.created_at && (
                    <p className="text-[11px] text-muted-foreground">{formatDate(prize.created_at)}</p>
                  )}
                </div>
                <div className="text-right">
                  {prize.skin_price !== null && prize.skin_price !== undefined && (
                    <p className="text-sm font-semibold text-green-500">${prize.skin_price}</p>
                  )}
                </div>
              </div>
            )
          })
        )}
      </Card>
      <Link href="/prizes" className="flex items-center justify-between text-xs text-muted-foreground px-1 mt-2">
        <span>{language === "ru" ? "Все призы" : "All prizes"}</span>
        <ChevronRight className="h-3 w-3" />
      </Link>
    </div>
  )
}
