"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Radio, Users } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { useEffect, useState } from "react"
import { apiGet } from "@/lib/api"

interface LiveStreamer {
  id: number
  display_name: string
  twitch_login: string
  is_live: boolean
  game_name?: string
  title?: string
  viewer_count: number
  started_at?: string
  thumbnail_url?: string
}

export function LiveStreamers() {
  const { t } = useI18n()
  const [streamers, setStreamers] = useState<LiveStreamer[]>([])
  const [loading, setLoading] = useState(true)

  const fetchLiveStreamers = async () => {
    try {
      const data = await apiGet("/streamers/live")
      setStreamers(data?.streamers || [])
    } catch (e) {
      console.error("Failed to fetch live streamers:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchLiveStreamers()
    
    // Обновляем каждые 30 секунд
    const interval = setInterval(fetchLiveStreamers, 30000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div>
      <div className="flex items-center gap-2 mb-3 px-1">
        <Radio className="h-4 w-4 text-destructive animate-pulse" />
        <h2 className="text-sm font-medium text-muted-foreground">{t.liveStreamers}</h2>
        {streamers.length > 0 && (
          <Badge variant="secondary" className="bg-destructive/20 text-destructive border-0 text-xs">
            {streamers.length}
          </Badge>
        )}
      </div>
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm divide-y divide-border/50">
        {loading ? (
          <div className="flex items-center gap-3 p-4 text-muted-foreground">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10 animate-pulse">
              <Radio className="h-5 w-5 text-destructive/70" />
            </div>
            <p className="text-sm">Loading...</p>
          </div>
        ) : streamers.length === 0 ? (
          <div className="flex items-center gap-3 p-4 text-muted-foreground">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <Radio className="h-5 w-5 text-destructive/70" />
            </div>
            <p className="text-sm">{t.noLiveStreamers}</p>
          </div>
        ) : (
          streamers.map((streamer) => (
            <a
              key={streamer.id}
              href={`https://twitch.tv/${streamer.twitch_login}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 p-3 hover:bg-secondary/30 transition-colors"
            >
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-[#9146ff] to-[#6441a5] flex items-center justify-center text-white font-bold text-sm ring-2 ring-destructive animate-pulse">
                  {streamer.display_name.charAt(0).toUpperCase()}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-destructive ring-2 ring-card animate-pulse" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{streamer.display_name}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {streamer.game_name || "Streaming"}
                </p>
              </div>
              <Badge variant="secondary" className="bg-destructive/20 text-destructive border-0 flex items-center gap-1">
                <Users className="h-3 w-3" />
                {streamer.viewer_count.toLocaleString()}
              </Badge>
            </a>
          ))
        )}
      </Card>
    </div>
  )
}
