"use client"

import { Card } from "@/components/ui/card"
import { Trophy, Coins, Calendar, Gift } from "lucide-react"
import { useI18n } from "@/lib/i18n"

export function Statistics() {
  const { t } = useI18n()

  const stats = [
    {
      icon: Trophy,
      label: t.totalPrizes,
      value: "1,247",
      color: "text-warning",
      bg: "bg-warning/20",
    },
    {
      icon: Coins,
      label: t.totalAmount,
      value: "₽842K",
      color: "text-success",
      bg: "bg-success/20",
    },
    {
      icon: Calendar,
      label: t.monthlyAmount,
      value: "₽127K",
      color: "text-primary",
      bg: "bg-primary/20",
    },
    {
      icon: Gift,
      label: t.items,
      value: "23",
      color: "text-accent",
      bg: "bg-accent/20",
    },
  ]

  return (
    <div>
      <h2 className="text-sm font-medium text-muted-foreground mb-3 px-1">{t.statistics}</h2>
      <div className="grid grid-cols-2 gap-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="border-border/50 bg-card/80 backdrop-blur-sm p-4">
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.bg}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <p className="text-lg font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}
