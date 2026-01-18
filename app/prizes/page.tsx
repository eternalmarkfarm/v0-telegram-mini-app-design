"use client"

import { MyPrizes } from "@/components/my-prizes"
import { useI18n } from "@/lib/i18n"

export default function ViewerPrizesPage() {
  const { language } = useI18n()

  return (
    <div className="px-4 py-6">
      <h1 className="text-xl font-semibold text-foreground mb-4">
        {language === "ru" ? "Все призы" : "All prizes"}
      </h1>
      <MyPrizes limit={50} showAllLink={false} />
    </div>
  )
}
