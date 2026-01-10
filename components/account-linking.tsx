"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Check, Link2 } from "lucide-react"

// Twitch icon component
function TwitchIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
    </svg>
  )
}

// Steam icon component
function SteamIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.606 0 11.979 0zM7.54 18.21l-1.473-.61c.262.543.714.999 1.314 1.25 1.297.539 2.793-.076 3.332-1.375.263-.63.264-1.319.005-1.949s-.75-1.121-1.377-1.383c-.624-.26-1.29-.249-1.878-.03l1.523.63c.956.4 1.409 1.5 1.009 2.455-.397.957-1.497 1.41-2.454 1.012H7.54zm11.415-9.303c0-1.662-1.353-3.015-3.015-3.015-1.665 0-3.015 1.353-3.015 3.015 0 1.665 1.35 3.015 3.015 3.015 1.663 0 3.015-1.35 3.015-3.015zm-5.273-.005c0-1.252 1.013-2.266 2.265-2.266 1.249 0 2.266 1.014 2.266 2.266 0 1.251-1.017 2.265-2.266 2.265-1.253 0-2.265-1.014-2.265-2.265z" />
    </svg>
  )
}

export function AccountLinking() {
  const [twitchLinked, setTwitchLinked] = useState(false)
  const [steamLinked, setSteamLinked] = useState(false)
  const [tradeUrl, setTradeUrl] = useState("")

  return (
    <div className="space-y-3">
      {/* Twitch Account */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#9146ff]/20">
              <TwitchIcon className="h-5 w-5 text-[#9146ff]" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">Twitch аккаунт</p>
              <p className="text-xs text-muted-foreground">{twitchLinked ? "streamer_name" : "Не привязан"}</p>
            </div>
            {twitchLinked ? (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/20">
                <Check className="h-4 w-4 text-success" />
              </div>
            ) : (
              <Button
                size="sm"
                onClick={() => setTwitchLinked(true)}
                className="bg-[#9146ff] hover:bg-[#7c3aed] text-white"
              >
                Привязать
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Steam Account */}
      <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1b2838]/50">
              <SteamIcon className="h-5 w-5 text-[#66c0f4]" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-foreground">Steam Trade URL</p>
              <p className="text-xs text-muted-foreground">{steamLinked ? "Привязан" : "Не привязан"}</p>
            </div>
            {steamLinked && (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/20">
                <Check className="h-4 w-4 text-success" />
              </div>
            )}
          </div>

          {!steamLinked && (
            <div className="space-y-2">
              <div className="relative">
                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Вставьте ссылку обмена Steam"
                  value={tradeUrl}
                  onChange={(e) => setTradeUrl(e.target.value)}
                  className="pl-10 bg-input border-border/50"
                />
              </div>
              <Button
                className="w-full bg-[#1b2838] hover:bg-[#2a475e] text-[#66c0f4]"
                onClick={() => setSteamLinked(true)}
                disabled={!tradeUrl}
              >
                <SteamIcon className="h-4 w-4 mr-2" />
                Привязать Steam
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  )
}
