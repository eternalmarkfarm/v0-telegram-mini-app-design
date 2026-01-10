"use client"

import { useState } from "react"
import { GiveawayStatus } from "@/components/giveaway-status"
import { AccountLinking } from "@/components/account-linking"
import { Statistics } from "@/components/statistics"
import { LiveStreamers } from "@/components/live-streamers"
import { TrackedStreamers } from "@/components/tracked-streamers"
import { MyPrizes } from "@/components/my-prizes"
import { BottomActions } from "@/components/bottom-actions"

export default function Home() {
  const [isTwitchLinked, setIsTwitchLinked] = useState(false)
  const [isSteamLinked, setIsSteamLinked] = useState(false)

  const handleTwitchLink = () => {
    setIsTwitchLinked(true)
  }

  const handleSteamLink = (url: string) => {
    if (url) {
      setIsSteamLinked(true)
    }
  }

  return (
    <main className="min-h-screen bg-background pb-8">
      <div className="mx-auto max-w-md px-4 py-4 space-y-4">
        <GiveawayStatus isTwitchLinked={isTwitchLinked} isSteamLinked={isSteamLinked} />
        <AccountLinking
          twitchLinked={isTwitchLinked}
          steamLinked={isSteamLinked}
          onTwitchLink={handleTwitchLink}
          onSteamLink={handleSteamLink}
        />
        <Statistics />
        <LiveStreamers />
        <TrackedStreamers />
        <MyPrizes />
        <BottomActions isTwitchLinked={isTwitchLinked} />
      </div>
    </main>
  )
}
