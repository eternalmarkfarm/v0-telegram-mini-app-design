"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Gift, ChevronRight, Sparkles } from "lucide-react"
import { useI18n } from "@/lib/i18n"

const prizes: Array<{
  id: number
  name: string
  game: string
  date: { ru: string; en: string }
  status: "pending" | "claimed"
  value: string
}> = []

export function MyPrizes() {
  const { t, language } = useI18n()

  return (
    <div>
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-warning" />
          <h2 className="text-sm font-medium text-muted-foreground">{t.myPrizes}</h2>
        </div>
        <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-primary/80">
          {language === "ru" ? "Все призы" : "All prizes"}
          <ChevronRight className="h-3 w-3 ml-1" />
        </Button>
      </div>
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm divide-y divide-border/50">
        {prizes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Gift className="h-10 w-10 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">{t.noPrizes}</p>
          </div>
        ) : (
          prizes.map((prize) => (
            <div key={prize.id} className="flex items-center gap-3 p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-warning/20">
                <Gift className="h-5 w-5 text-warning" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{prize.name}</p>
                <p className="text-xs text-muted-foreground">
                  {prize.game} • {prize.date[language]}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-success">{prize.value}</p>
                <p className={`text-xs ${prize.status === "pending" ? "text-warning" : "text-muted-foreground"}`}>
                  {prize.status === "pending"
                    ? language === "ru"
                      ? "Ожидает"
                      : "Pending"
                    : language === "ru"
                      ? "Получен"
                      : "Claimed"}
                </p>
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  )
}
