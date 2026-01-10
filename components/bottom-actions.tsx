"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings, MessageCircle, Radio, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useI18n } from "@/lib/i18n"

export function BottomActions() {
  const { t } = useI18n()

  const actions = [
    {
      icon: Settings,
      label: t.settings,
      description: t.notificationsAndAccount,
      href: "/settings",
    },
    {
      icon: MessageCircle,
      label: t.support,
      description: t.helpAndFaq,
      href: "#support",
    },
    {
      icon: Radio,
      label: t.startStreaming,
      description: t.streamerCabinet,
      highlight: true,
      href: "/streamer",
    },
  ]

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm divide-y divide-border/50">
      {actions.map((action) => (
        <Button
          key={action.label}
          variant="ghost"
          asChild
          className={`w-full justify-start h-auto p-4 rounded-none first:rounded-t-lg last:rounded-b-lg hover:bg-secondary/50 ${
            action.highlight ? "bg-primary/5" : ""
          }`}
        >
          <Link href={action.href}>
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-lg mr-3 ${
                action.highlight ? "bg-primary/20" : "bg-secondary"
              }`}
            >
              <action.icon className={`h-5 w-5 ${action.highlight ? "text-primary" : "text-muted-foreground"}`} />
            </div>
            <div className="flex-1 text-left">
              <p className={`font-medium ${action.highlight ? "text-primary" : "text-foreground"}`}>{action.label}</p>
              <p className="text-xs text-muted-foreground">{action.description}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </Link>
        </Button>
      ))}
    </Card>
  )
}
