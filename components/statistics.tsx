"use client"

import { useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Trophy, Coins, Calendar, Gift } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { apiGet, apiPost } from "@/lib/api"

type PrizeItem = {
  skin_price?: number | null
  delivery_status?: string | null
  created_at?: string | null
}

export function Statistics() {
  const { t, language } = useI18n()
  const [items, setItems] = useState<PrizeItem[]>([])

  const load = async () => {
    try {
      await apiPost("/viewer/prizes/refresh", {})
      const data = await apiGet("/viewer/prizes?limit=50")
      setItems(data?.items ?? [])
    } catch (e) {
      console.error("Failed to load statistics:", e)
    }
  }

  useEffect(() => {
    load()
    const interval = setInterval(load, 30000)
    return () => clearInterval(interval)
  }, [])

  const stats = useMemo(() => {
    const totalPrizes = items.length
    const totalAmount = items.reduce((sum, item) => sum + (item.skin_price || 0), 0)
    const receivedCount = items.filter((item) => item.delivery_status === "success").length

    const monthAgo = new Date()
    monthAgo.setDate(monthAgo.getDate() - 30)
    const monthlyAmount = items.reduce((sum, item) => {
      if (!item.created_at) return sum
      const date = new Date(item.created_at)
      if (Number.isNaN(date.getTime()) || date < monthAgo) return sum
      return sum + (item.skin_price || 0)
    }, 0)

    const formatAmount = (value: number) => `$${value.toFixed(2)}`

    return [
      {
        icon: Trophy,
        label: t.totalPrizes,
        value: totalPrizes ? String(totalPrizes) : "0",
        color: "text-warning",
        bg: "bg-warning/20",
      },
      {
        icon: Coins,
        label: t.totalAmount,
        value: formatAmount(totalAmount),
        color: "text-success",
        bg: "bg-success/20",
      },
      {
        icon: Calendar,
        label: t.monthlyAmount,
        value: formatAmount(monthlyAmount),
        color: "text-primary",
        bg: "bg-primary/20",
      },
      {
        icon: Gift,
        label: t.items,
        value: receivedCount ? String(receivedCount) : "0",
        color: "text-accent",
        bg: "bg-accent/20",
      },
    ]
  }, [items, t.totalPrizes, t.totalAmount, t.monthlyAmount, t.items])

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
      {items.length === 0 && (
        <p className="text-xs text-muted-foreground/80 mt-2 px-1">{t.noStatistics}</p>
      )}
    </div>
  )
}
