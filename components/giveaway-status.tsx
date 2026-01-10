"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Gift, CheckCircle2, XCircle } from "lucide-react"

export function GiveawayStatus() {
  const [isParticipating] = useState(true)

  return (
    <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
      <div className="relative p-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl ${
              isParticipating ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"
            }`}
          >
            <Gift className="h-6 w-6" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Статус участия</p>
            <div className="flex items-center gap-2 mt-0.5">
              {isParticipating ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span className="font-semibold text-success">Вы участвуете в розыгрыше</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold text-muted-foreground">Вы не участвуете</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}
