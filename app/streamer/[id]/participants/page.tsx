"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useI18n } from "@/lib/i18n"
import { apiGet } from "@/lib/api"

type Participant = {
  twitch_login?: string | null
  last_chat_at?: string | null
}

export default function StreamerParticipantsPage({ params }: { params?: { id?: string } }) {
  const { language } = useI18n()
  const [items, setItems] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [resolvedId, setResolvedId] = useState<string | null>(params?.id ?? null)

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

  useEffect(() => {
    if (params?.id) {
      setResolvedId(params.id)
      return
    }
    if (typeof window === "undefined") return
    const parts = window.location.pathname.split("/").filter(Boolean)
    const idx = parts.indexOf("streamer")
    const next = idx >= 0 ? parts[idx + 1] : null
    if (next) setResolvedId(next)
  }, [params?.id])

  const load = async () => {
    if (!resolvedId) {
      setError(language === "ru" ? "Не найден ID стримера." : "Missing streamer id.")
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const res = await apiGet(`/streamers/${resolvedId}/participants`)
      setItems(res?.items ?? [])
    } catch (e: any) {
      setError(String(e?.message ?? e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!resolvedId) return
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [resolvedId])

  return (
    <main className="min-h-screen bg-background pb-8">
      <div className="mx-auto max-w-md px-4 py-4 space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link href={`/streamer/${resolvedId ?? ""}`}>
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-lg font-bold text-foreground">
              {language === "ru" ? "Все участники" : "All participants"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {language === "ru"
                ? "Только зрители, писавшие в чат за последний час"
                : "Only viewers who chatted within the last hour"}
            </p>
          </div>
        </div>

        <Card className="border-border/50 bg-card/80 backdrop-blur-sm divide-y divide-border/50">
          {loading ? (
            <div className="p-4 text-sm text-muted-foreground">Loading...</div>
          ) : error ? (
            <div className="p-4 text-sm text-red-500">{error}</div>
          ) : items.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">
              {language === "ru" ? "Пока нет участников" : "No participants yet"}
            </div>
          ) : (
            items.map((item, idx) => (
              <div key={`${item.twitch_login ?? "viewer"}-${idx}`} className="p-3">
                <p className="text-sm font-semibold text-foreground">
                  {item.twitch_login ? `@${item.twitch_login}` : language === "ru" ? "Зритель" : "Viewer"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {item.last_chat_at ? formatDate(item.last_chat_at) : language === "ru" ? "Нет данных" : "No data"}
                </p>
              </div>
            ))
          )}
        </Card>
      </div>
    </main>
  )
}
