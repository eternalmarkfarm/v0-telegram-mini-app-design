"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { MyPrizes } from "@/components/my-prizes"
import { useI18n } from "@/lib/i18n"
import { Button } from "@/components/ui/button"

export default function ViewerPrizesPage() {
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
          {language === "ru" ? "Все призы" : "All prizes"}
        </h1>
      </div>
      <MyPrizes limit={50} showAllLink={false} />
    </div>
  )
}
