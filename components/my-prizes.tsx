"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Gift, ChevronRight, Sparkles, Clock, CheckCircle, XCircle } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { apiGet, apiPost } from "@/lib/api"
import Link from "next/link"

type PrizeItem = {
  id: number
  skin_name?: string | null
  skin_price?: number | null
  delivery_status?: string | null
  created_at?: string | null
  streamer?: {
    twitch_login?: string | null
    display_name?: string | null
  }
}

type MyPrizesProps = {
  limit?: number
  showAllLink?: boolean
}

export function MyPrizes({ limit = 20, showAllLink = true }: MyPrizesProps) {
  const { t, language } = useI18n()
  const [items, setItems] = useState<PrizeItem[]>([])
  const [loading, setLoading] = useState(true)

  const load = async () => {
    try {
      await apiPost("/viewer/prizes/refresh", {});
      const data = await apiGet(`/viewer/prizes?limit=${limit}`)
      setItems(data?.items ?? [])
    } catch (e) {
      console.error("Failed to load prizes:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [])

  const statusLabel = (status?: string | null) => {
    if (status === "success") return language === "ru" ? "Получен" : "Received"
    if (status === "sent") return language === "ru" ? "Отправлено" : "Sent"
    if (status === "failed") return language === "ru" ? "Не удалось" : "Failed"
    return language === "ru" ? "В обработке" : "Processing"
  }

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
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-warning" />
          <h2 className="text-sm font-medium text-muted-foreground">{t.myPrizes}</h2>
        </div>
        {showAllLink && (
          <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-primary/80" asChild>
            <Link href="/prizes">
              {language === "ru" ? "Все призы" : "All prizes"}
              <ChevronRight className="h-3 w-3 ml-1" />
            </Link>
          </Button>
        )}
      </div>
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm divide-y divide-border/50">
        {loading ? (
          <div className="flex items-center gap-3 p-4 text-muted-foreground">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/40">
              <Clock className="h-5 w-5 text-muted-foreground/70" />
            </div>
            <p className="text-sm">Loading...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Gift className="h-10 w-10 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">{t.noPrizes}</p>
          </div>
        ) : (
          items.map((prize) => {
            const status = prize.delivery_status
            const icon =
              status === "success" ? (
                <CheckCircle className="h-5 w-5 text-success" />
              ) : status === "failed" ? (
                <XCircle className="h-5 w-5 text-destructive" />
              ) : (
                <Clock className="h-5 w-5 text-warning" />
              )
            const streamerLabel = prize.streamer?.twitch_login
              ? `@${prize.streamer.twitch_login}`
              : prize.streamer?.display_name || t.fromStreamer
            return (
              <div key={prize.id} className="flex items-center gap-3 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/20">
                  {icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-foreground truncate">
                    {prize.skin_name || (language === "ru" ? "Скин" : "Skin")}
                  </p>
                  <p className="text-xs text-muted-foreground">{streamerLabel}</p>
                  {prize.created_at && (
                    <p className="text-[11px] text-muted-foreground">{formatDate(prize.created_at)}</p>
                  )}
                  {status === "sent" && (
                    <p className="text-[11px] text-warning">
                      {language === "ru"
                        ? "Прими трейд в течение 5–7 минут"
                        : "Accept the trade within 5–7 minutes"}
                    </p>
                  )}
                </div>
                <div className="text-right">
                  {prize.skin_price !== null && prize.skin_price !== undefined && (
                    <p className="text-sm font-semibold text-foreground">${prize.skin_price}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{statusLabel(status)}</p>
                </div>
              </div>
            )
          })
        )}
      </Card>
    </div>
  )
}
