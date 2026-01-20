"use client"

import { useEffect, useMemo, useState } from "react"
import { Card } from "@/components/ui/card"
import { Trophy, Coins } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { apiGet } from "@/lib/api"

type PublicStats = {
  total_prizes: number
  total_amount: number
}

export function Statistics() {
  const { language } = useI18n()
  const [statsData, setStatsData] = useState<PublicStats | null>(null)

  const load = async () => {
    try {
      const data = await apiGet("/public/stats")
      setStatsData(data ?? null)
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
    const totalPrizes = statsData?.total_prizes ?? 0
    const totalAmount = statsData?.total_amount ?? 0
    const formatAmount = (value: number) => `$${value.toFixed(2)}`
    return [
      {
        icon: Trophy,
        label: language === "ru" ? "Разыграно призов" : "Prizes given",
        value: String(totalPrizes),
        color: "text-warning",
        bg: "bg-warning/20",
      },
      {
        icon: Coins,
        label: language === "ru" ? "Сумма всего" : "Total amount",
        value: formatAmount(totalAmount),
        color: "text-success",
        bg: "bg-success/20",
      },
    ]
  }, [statsData, language])

  return (
    <div>
      <h2 className="text-sm font-medium text-muted-foreground mb-3 px-1">
        {language === "ru" ? "Общая статистика" : "Overall statistics"}
      </h2>
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
