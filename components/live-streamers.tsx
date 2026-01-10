"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Radio } from "lucide-react"
import { useI18n } from "@/lib/i18n"

const liveStreamers = [
  {
    name: "silvername",
    game: "CS2",
    viewers: "12.4K",
    avatar: "/gamer-avatar-blue-esports.jpg",
  },
  {
    name: "donbass",
    game: "Dota 2",
    viewers: "8.2K",
    avatar: "/gamer-avatar-red-gaming.jpg",
  },
  {
    name: "arthas",
    game: "World of Warcraft",
    viewers: "5.1K",
    avatar: "/gamer-avatar-purple-wow.jpg",
  },
]

export function LiveStreamers() {
  const { t } = useI18n()

  return (
    <div>
      <div className="flex items-center gap-2 mb-3 px-1">
        <Radio className="h-4 w-4 text-destructive animate-pulse" />
        <h2 className="text-sm font-medium text-muted-foreground">{t.liveStreamers}</h2>
      </div>
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm divide-y divide-border/50">
        {liveStreamers.map((streamer) => (
          <div key={streamer.name} className="flex items-center gap-3 p-3">
            <div className="relative">
              <img
                src={streamer.avatar || "/placeholder.svg"}
                alt={streamer.name}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-destructive"
              />
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-destructive ring-2 ring-card" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-foreground truncate">{streamer.name}</p>
              <p className="text-xs text-muted-foreground truncate">{streamer.game}</p>
            </div>
            <Badge variant="secondary" className="bg-destructive/20 text-destructive border-0">
              {streamer.viewers}
            </Badge>
          </div>
        ))}
      </Card>
    </div>
  )
}
