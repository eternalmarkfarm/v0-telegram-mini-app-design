"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Globe, Check } from "lucide-react"
import Link from "next/link"
import { useI18n } from "@/lib/i18n"

export default function SettingsPage() {
  const { t, language, setLanguage } = useI18n()

  const languages = [
    { code: "ru" as const, label: t.russian, flag: "🇷🇺" },
    { code: "en" as const, label: t.english, flag: "🇬🇧" },
  ]

  return (
    <main className="min-h-screen bg-background pb-8">
      <div className="mx-auto max-w-md px-4 py-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link href="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-lg font-bold text-foreground">{t.settings}</h1>
            <p className="text-xs text-muted-foreground">{t.notificationsAndAccount}</p>
          </div>
        </div>

        {/* Language Selection */}
        <div>
          <div className="flex items-center gap-2 mb-3 px-1">
            <Globe className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-sm font-medium text-muted-foreground">{t.language}</h2>
          </div>
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm divide-y divide-border/50">
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className={`w-full flex items-center gap-3 p-4 transition-colors hover:bg-secondary/50 first:rounded-t-lg last:rounded-b-lg ${
                  language === lang.code ? "bg-primary/10" : ""
                }`}
              >
                <span className="text-2xl">{lang.flag}</span>
                <span className="flex-1 text-left font-medium text-foreground">{lang.label}</span>
                {language === lang.code && (
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                    <Check className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
              </button>
            ))}
          </Card>
        </div>
      </div>
    </main>
  )
}
