"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Gift, ChevronRight, Sparkles } from "lucide-react"

const prizes = [
  {
    id: 1,
    name: "AK-47 | Asiimov",
    game: "CS2",
    date: "2 дня назад",
    status: "pending",
    value: "₽4,500",
  },
  {
    id: 2,
    name: "Arcana Pudge",
    game: "Dota 2",
    date: "1 неделю назад",
    status: "claimed",
    value: "₽2,800",
  },
]

export function MyPrizes() {
  return (
    <div>
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-warning" />
          <h2 className="text-sm font-medium text-muted-foreground">Мои призы</h2>
        </div>
        <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-primary/80">
          Все призы
          <ChevronRight className="h-3 w-3 ml-1" />
        </Button>
      </div>
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm divide-y divide-border/50">
        {prizes.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Gift className="h-10 w-10 text-muted-foreground/50 mb-2" />
            <p className="text-sm text-muted-foreground">Пока нет выигранных призов</p>
            <p className="text-xs text-muted-foreground/70">Участвуйте в розыгрышах!</p>
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
                  {prize.game} • {prize.date}
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-success">{prize.value}</p>
                <p className={`text-xs ${prize.status === "pending" ? "text-warning" : "text-muted-foreground"}`}>
                  {prize.status === "pending" ? "Ожидает" : "Получен"}
                </p>
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  )
}
