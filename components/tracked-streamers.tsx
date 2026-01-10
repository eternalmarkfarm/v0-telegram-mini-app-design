"use client"

import { Card } from "@/components/ui/card"
import { Users } from "lucide-react"
import { useI18n } from "@/lib/i18n"

const trackedStreamers = [
  {
    name: "welovegames",
    status: "offline",
    avatar: "/gamer-avatar-green.jpg",
  },
  {
    name: "jove",
    status: "offline",
    avatar: "/gamer-avatar-orange.jpg",
  },
  {
    name: "maddyson",
    status: "offline",
    avatar: "/gamer-avatar-yellow.jpg",
  },
  {
    name: "evelone",
    status: "offline",
    avatar: "/gamer-avatar-cyan.jpg",
  },
]

export function TrackedStreamers() {
  const { t } = useI18n()

  return (
    <div>
      <div className="flex items-center gap-2 mb-3 px-1">
        <Users className="h-4 w-4 text-muted-foreground" />
        <h2 className="text-sm font-medium text-muted-foreground">{t.trackedStreamers}</h2>
      </div>
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm p-3">
        <div className="flex items-center gap-3 overflow-x-auto pb-1">
          {trackedStreamers.map((streamer) => (
            <div key={streamer.name} className="flex flex-col items-center gap-1.5 shrink-0">
              <div className="relative">
                <img
                  src={streamer.avatar || "/placeholder.svg"}
                  alt={streamer.name}
                  className="h-12 w-12 rounded-full object-cover ring-2 ring-border/50 opacity-60"
                />
              </div>
              <p className="text-xs text-muted-foreground truncate max-w-[60px]">{streamer.name}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
