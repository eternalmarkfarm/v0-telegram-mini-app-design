"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, ChevronRight } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { apiGet } from "@/lib/api"

type TrackedStreamer = {
  id: number
  display_name?: string | null
  twitch_login?: string | null
  twitch_display_name?: string | null
  profile_image_url?: string | null
  is_live?: boolean
  viewer_count?: number | null
}

export function TrackedStreamers() {
  const { t, language } = useI18n()
  const [tracked, setTracked] = useState<TrackedStreamer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadTracked = async () => {
    setError(null)
    try {
      const data = await apiGet("/viewer/tracked")
      setTracked(data?.streamers ?? [])
    } catch (e: any) {
      setError(String(e?.message ?? e))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadTracked()
  }, [])

  return (
    <div>
      <div className="flex items-center gap-2 mb-3 px-1">
        <Users className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-medium text-muted-foreground">{t.trackedStreamers}</h2>
      </div>
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm p-3 space-y-3">
        {error && <p className="text-xs text-red-500">{error}</p>}
        {loading ? (
          <div className="flex items-center gap-3 p-2 text-muted-foreground">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/40">
              <Users className="h-5 w-5 text-muted-foreground/70" />
            </div>
            <p className="text-sm">Loading...</p>
          </div>
        ) : tracked.length === 0 ? (
          <div className="flex items-center gap-3 p-2 text-muted-foreground">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted/40">
              <Users className="h-5 w-5 text-muted-foreground/70" />
            </div>
            <p className="text-sm">{t.noTrackedStreamers}</p>
          </div>
        ) : (
          <div className="flex items-center gap-3 overflow-x-auto pb-1">
            {[...tracked]
              .sort((a, b) => Number(Boolean(b.is_live)) - Number(Boolean(a.is_live)))
              .map((streamer) => {
              const name =
                streamer.twitch_display_name ||
                streamer.display_name ||
                streamer.twitch_login ||
                `#${streamer.id}`
              return (
                <Link
                  key={streamer.id}
                  href={`/streamer/${streamer.id}`}
                  className="flex flex-col items-center gap-1.5 shrink-0"
                >
                  <div className="relative">
                    {streamer.profile_image_url ? (
                      <img
                        src={streamer.profile_image_url}
                        alt={name}
                        className={`h-12 w-12 rounded-full object-cover ring-2 ${
                          streamer.is_live ? "ring-success" : "ring-border/50 opacity-70"
                        }`}
                      />
                    ) : (
                      <div className="h-12 w-12 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground">
                        {name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground truncate max-w-[70px]">{name}</p>
                  {streamer.is_live ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-destructive/20 text-destructive text-[11px] font-semibold px-2 py-0.5">
                      <span className="h-1.5 w-1.5 rounded-full bg-destructive animate-pulse" />
                      LIVE
                      {typeof streamer.viewer_count === "number" && (
                        <span className="text-[10px] font-medium text-destructive/80">
                          {streamer.viewer_count.toLocaleString()}
                        </span>
                      )}
                    </span>
                  ) : (
                    <span className="text-[10px] text-muted-foreground uppercase">offline</span>
                  )}
                </Link>
              )
            })}
          </div>
        )}
        <Link href="/tracked" className="flex items-center justify-between text-xs text-muted-foreground px-1">
          <span>{language === "ru" ? "Управлять списком" : "Manage list"}</span>
          <ChevronRight className="h-3 w-3" />
        </Link>
      </Card>
    </div>
  )
}
