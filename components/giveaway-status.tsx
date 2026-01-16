"use client"

import { Card } from "@/components/ui/card"
import { Gift, CheckCircle2, XCircle, Ban } from "lucide-react"
import { useI18n } from "@/lib/i18n"

interface GiveawayStatusProps {
  isTwitchLinked: boolean
  isSteamLinked: boolean
}

export function GiveawayStatus({ isTwitchLinked, isSteamLinked }: GiveawayStatusProps) {
  const { t } = useI18n()
  const isParticipating = isTwitchLinked && isSteamLinked

  return (
    <Card className="relative overflow-hidden border-border/50 bg-card/80 backdrop-blur-sm">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
      <div className="relative p-3">
        <div className="flex items-center gap-3">
          <div
            className={`relative flex h-12 w-12 items-center justify-center rounded-xl ${
              isParticipating ? "bg-success/20 text-success" : "bg-muted/50 text-muted-foreground"
            }`}
          >
            <Gift className="h-7 w-7" />
            {!isParticipating && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Ban className="h-14 w-14 text-destructive/60" />
              </div>
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">
              {isParticipating ? t.canParticipate : t.participationStatus}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              {isParticipating ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-success" />
                  <span className="font-semibold text-success">{t.youParticipate}</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="font-semibold text-muted-foreground">{t.youDontParticipate}</span>
                </>
              )}
            </div>
            {!isParticipating && <p className="text-xs text-muted-foreground/70 mt-1">{t.linkAccountsToParticipate}</p>}
          </div>
        </div>
      </div>
    </Card>
  )
}
