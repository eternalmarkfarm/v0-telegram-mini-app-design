"use client"

import { useEffect, useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Users, Plus, Trash2 } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { apiDelete, apiGet, apiPost } from "@/lib/api"

type TrackedStreamer = {
  id: number
  display_name?: string | null
  twitch_login?: string | null
  twitch_display_name?: string | null
  profile_image_url?: string | null
  is_live?: boolean
}

export function TrackedStreamers() {
  const { t, language } = useI18n()
  const [tracked, setTracked] = useState<TrackedStreamer[]>([])
  const [loading, setLoading] = useState(true)
  const [loginInput, setLoginInput] = useState("")
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

  const handleAdd = async () => {
    const login = loginInput.trim()
    if (!login) return
    setError(null)
    try {
      await apiPost("/viewer/tracked", { twitch_login: login })
      setLoginInput("")
      await loadTracked()
    } catch (e: any) {
      setError(String(e?.message ?? e))
    }
  }

  const handleRemove = async (streamerId: number) => {
    setError(null)
    try {
      await apiDelete(`/viewer/tracked/${streamerId}`)
      await loadTracked()
    } catch (e: any) {
      setError(String(e?.message ?? e))
    }
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-3 px-1">
        <Users className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-medium text-muted-foreground">{t.trackedStreamers}</h2>
      </div>
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm p-3 space-y-3">
        <div className="flex items-center gap-2">
          <Input
            value={loginInput}
            onChange={(e) => setLoginInput(e.target.value)}
            placeholder={language === "ru" ? "Twitch логин" : "Twitch login"}
            className="h-9"
          />
          <Button onClick={handleAdd} className="h-9 px-3">
            <Plus className="h-4 w-4 mr-1" />
            {language === "ru" ? "Добавить" : "Add"}
          </Button>
        </div>
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
            {tracked.map((streamer) => {
              const name =
                streamer.twitch_display_name ||
                streamer.display_name ||
                streamer.twitch_login ||
                `#${streamer.id}`
              return (
                <div key={streamer.id} className="flex flex-col items-center gap-1.5 shrink-0">
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
                    <Button
                      size="icon"
                      variant="ghost"
                      className="absolute -right-2 -top-2 h-6 w-6 rounded-full bg-card/90"
                      onClick={() => handleRemove(streamer.id)}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground truncate max-w-[70px]">{name}</p>
                  <p className={`text-[10px] ${streamer.is_live ? "text-success" : "text-muted-foreground"}`}>
                    {streamer.is_live ? (language === "ru" ? "онлайн" : "online") : (language === "ru" ? "оффлайн" : "offline")}
                  </p>
                </div>
              )
            })}
          </div>
        )}
      </Card>
    </div>
  )
}
