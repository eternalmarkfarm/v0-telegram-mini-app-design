"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useI18n } from "@/lib/i18n"
import { Button } from "@/components/ui/button"

export default function RulesPage() {
  const { language } = useI18n()

  return (
    <div className="px-4 py-6">
      <div className="flex items-center gap-3 mb-4">
        <Button variant="ghost" size="icon" asChild className="shrink-0">
          <Link href="/">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <h1 className="text-xl font-semibold text-foreground">
          {language === "ru" ? "Правила участия" : "Participation rules"}
        </h1>
      </div>

      <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/15">
            <span className="text-3xl font-bold text-destructive">!</span>
          </div>
          <div>
            <p className="text-sm font-semibold text-destructive">
              {language === "ru" ? "Важно" : "Important"}
            </p>
            <p className="text-xs text-muted-foreground">
              {language === "ru"
                ? "Эти условия обязательны для участия в розыгрышах."
                : "These requirements are mandatory to participate in giveaways."}
            </p>
          </div>
        </div>

        <div className="text-sm text-muted-foreground leading-relaxed">
          {language === "ru" ? (
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="mt-1 text-destructive text-lg leading-none">•</span>
                <span>
                  Быть фоловером стримера на{" "}
                  <span className="inline-flex items-center gap-1 text-[#9146ff]">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
                    </svg>
                    Twitch
                  </span>
                  .
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-destructive text-lg leading-none">•</span>
                <span>
                  Отслеживать стримера в{" "}
                  <span className="inline-flex items-center gap-1 text-primary">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1.2 14.2-2.2-2.2 7-7 2.2 2.2-7 7z" />
                    </svg>
                    MINI APP
                  </span>{" "}
                  и привязать Twitch аккаунт + Steam Trade URL.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-destructive text-lg leading-none">•</span>
                <span>
                  Профиль и инвентарь должны быть открыты в настройках приватности{" "}
                  <span className="inline-flex items-center gap-1 text-[#66c0f4]">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.606 0 11.979 0z" />
                    </svg>
                    Steam
                  </span>
                  .
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-destructive text-lg leading-none">•</span>
                <span>Раз в час писать хотя бы одно сообщение в чате стримера.</span>
              </li>
            </ul>
          ) : (
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="mt-1 text-destructive text-lg leading-none">•</span>
                <span>
                  Follow the streamer on{" "}
                  <span className="inline-flex items-center gap-1 text-[#9146ff]">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z" />
                    </svg>
                    Twitch
                  </span>
                  .
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-destructive text-lg leading-none">•</span>
                <span>
                  Track the streamer in{" "}
                  <span className="inline-flex items-center gap-1 text-primary">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm-1.2 14.2-2.2-2.2 7-7 2.2 2.2-7 7z" />
                    </svg>
                    MINI APP
                  </span>{" "}
                  and link Twitch + Steam Trade URL.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-destructive text-lg leading-none">•</span>
                <span>
                  Your profile and inventory must be public in{" "}
                  <span className="inline-flex items-center gap-1 text-[#66c0f4]">
                    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M11.979 0C5.678 0 .511 4.86.022 11.037l6.432 2.658c.545-.371 1.203-.59 1.912-.59.063 0 .125.004.188.006l2.861-4.142V8.91c0-2.495 2.028-4.524 4.524-4.524 2.494 0 4.524 2.031 4.524 4.527s-2.03 4.525-4.524 4.525h-.105l-4.076 2.911c0 .052.004.105.004.159 0 1.875-1.515 3.396-3.39 3.396-1.635 0-3.016-1.173-3.331-2.727L.436 15.27C1.862 20.307 6.486 24 11.979 24c6.627 0 11.999-5.373 11.999-12S18.606 0 11.979 0z" />
                    </svg>
                    Steam
                  </span>
                  .
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 text-destructive text-lg leading-none">•</span>
                <span>Send at least one chat message every hour.</span>
              </li>
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
