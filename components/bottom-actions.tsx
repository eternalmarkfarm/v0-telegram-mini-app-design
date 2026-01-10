"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Settings, MessageCircle, Radio, ChevronRight } from "lucide-react"

const actions = [
  {
    icon: Settings,
    label: "Настройки",
    description: "Уведомления и аккаунт",
  },
  {
    icon: MessageCircle,
    label: "Техподдержка",
    description: "Помощь и FAQ",
  },
  {
    icon: Radio,
    label: "Начать стримить",
    description: "Стать партнёром",
    highlight: true,
  },
]

export function BottomActions() {
  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm divide-y divide-border/50">
      {actions.map((action) => (
        <Button
          key={action.label}
          variant="ghost"
          className={`w-full justify-start h-auto p-4 rounded-none first:rounded-t-lg last:rounded-b-lg hover:bg-secondary/50 ${
            action.highlight ? "bg-primary/5" : ""
          }`}
        >
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
        </Button>
      ))}
    </Card>
  )
}
