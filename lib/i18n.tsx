"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"

type Language = "ru" | "en"

interface Translations {
  // Giveaway Status
  participationStatus: string
  youParticipate: string
  youDontParticipate: string
  linkAccountsToParticipate: string

  // Account Linking
  twitchAccount: string
  notLinked: string
  linked: string
  link: string
  syncing: string
  steamTradeUrl: string
  whereToFind: string
  steamPath: string
  pasteSteamLink: string
  linkSteam: string
  unlink: string

  // Statistics
  statistics: string
  totalPrizes: string
  items: string
  monthlyAmount: string
  totalAmount: string
  thisMonth: string
  noStatistics: string

  // Live Streamers
  liveStreamers: string
  viewers: string
  noLiveStreamers: string
  noTrackedStreamers: string

  // Tracked Streamers
  trackedStreamers: string
  online: string
  offline: string

  // My Prizes
  myPrizes: string
  fromStreamer: string
  noPrizes: string

  // Bottom Actions
  settings: string
  notificationsAndAccount: string
  support: string
  helpAndFaq: string
  startStreaming: string
  linkTwitch: string
  personalCabinet: string
  streamerCabinet: string

  // Settings Page
  language: string
  selectLanguage: string
  russian: string
  english: string
  back: string

  // Streamer Page
  streamerDashboard: string
  yourStatistics: string
  eventsSettings: string
  sentSkins: string
  downloadConfig: string
  recipient: string
  noSentSkins: string
}

const translations: Record<Language, Translations> = {
  ru: {
    participationStatus: "Статус участия",
    youParticipate: "Вы участвуете в розыгрыше",
    youDontParticipate: "Вы не участвуете",
    linkAccountsToParticipate: "Привяжите аккаунты для участия",

    twitchAccount: "Twitch аккаунт",
    notLinked: "Не привязан",
    linked: "Привязан",
    link: "Привязать",
    syncing: "Синхронизация",
    steamTradeUrl: "Steam Trade URL",
    whereToFind: "Где найти:",
    steamPath: "Steam → Инвентарь → Предложения обмена → «Кто может присылать мне предложения?»",
    pasteSteamLink: "Вставьте ссылку обмена Steam",
    linkSteam: "Привязать Steam",
    unlink: "Удалить",

    statistics: "Статистика",
    totalPrizes: "Всего призов",
    items: "предметов",
    monthlyAmount: "За месяц",
    totalAmount: "Всего разыграно",
    thisMonth: "этот месяц",
    noStatistics: "Данные появятся после первых розыгрышей",

    liveStreamers: "Сейчас стримят",
    viewers: "зрителей",
    noLiveStreamers: "Нет активных стримов",
    noTrackedStreamers: "Пока нет отслеживаемых стримеров",

    trackedStreamers: "Отслеживаемые стримеры",
    online: "онлайн",
    offline: "оффлайн",

    myPrizes: "Мои призы",
    fromStreamer: "от",
    noPrizes: "У вас пока нет призов",

    settings: "Настройки",
    notificationsAndAccount: "Уведомления и аккаунт",
    support: "Техподдержка",
    helpAndFaq: "Помощь и FAQ",
    startStreaming: "Начать стримить",
    linkTwitch: "Привяжите Twitch",
    personalCabinet: "Личный кабинет",
    streamerCabinet: "Кабинет стримера",

    language: "Язык",
    selectLanguage: "Выберите язык",
    russian: "Русский",
    english: "English",
    back: "Назад",

    streamerDashboard: "Кабинет стримера",
    yourStatistics: "Ваша статистика",
    eventsSettings: "Настройка событий",
    sentSkins: "Отправленные скины",
    downloadConfig: "Скачать конфиг",
    recipient: "Получатель",
    noSentSkins: "Нет отправленных скинов",
  },
  en: {
    participationStatus: "Participation Status",
    youParticipate: "You are participating in the giveaway",
    youDontParticipate: "You are not participating",
    linkAccountsToParticipate: "Link accounts to participate",

    twitchAccount: "Twitch Account",
    notLinked: "Not linked",
    linked: "Linked",
    link: "Link",
    syncing: "Syncing",
    steamTradeUrl: "Steam Trade URL",
    whereToFind: "Where to find:",
    steamPath: 'Steam → Inventory → Trade Offers → "Who can send me Trade Offers?"',
    pasteSteamLink: "Paste your Steam trade URL",
    linkSteam: "Link Steam",
    unlink: "Unlink",

    statistics: "Statistics",
    totalPrizes: "Total Prizes",
    items: "items",
    monthlyAmount: "This Month",
    totalAmount: "Total Given Away",
    thisMonth: "this month",
    noStatistics: "Data will appear after the first giveaways",

    liveStreamers: "Live Now",
    viewers: "viewers",
    noLiveStreamers: "No active streams",
    noTrackedStreamers: "No tracked streamers yet",

    trackedStreamers: "Tracked Streamers",
    online: "online",
    offline: "offline",

    myPrizes: "My Prizes",
    fromStreamer: "from",
    noPrizes: "You have no prizes yet",

    settings: "Settings",
    notificationsAndAccount: "Notifications and account",
    support: "Support",
    helpAndFaq: "Help and FAQ",
    startStreaming: "Start Streaming",
    linkTwitch: "Link Twitch",
    personalCabinet: "Dashboard",
    streamerCabinet: "Streamer Dashboard",

    language: "Language",
    selectLanguage: "Select language",
    russian: "Русский",
    english: "English",
    back: "Back",

    streamerDashboard: "Streamer Dashboard",
    yourStatistics: "Your Statistics",
    eventsSettings: "Events Settings",
    sentSkins: "Sent Skins",
    downloadConfig: "Download Config",
    recipient: "Recipient",
    noSentSkins: "No skins sent yet",
  },
}

interface I18nContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: Translations
}

const I18nContext = createContext<I18nContextType | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("ru")

  useEffect(() => {
    const saved = localStorage.getItem("language") as Language
    if (saved && (saved === "ru" || saved === "en")) {
      setLanguage(saved)
    }
  }, [])

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem("language", lang)
  }

  return (
    <I18nContext.Provider
      value={{
        language,
        setLanguage: handleSetLanguage,
        t: translations[language],
      }}
    >
      {children}
    </I18nContext.Provider>
  )
}

export function useI18n() {
  const context = useContext(I18nContext)
  if (!context) {
    throw new Error("useI18n must be used within an I18nProvider")
  }
  return context
}
