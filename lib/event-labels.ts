type EventLabels = {
  ru: string
  en: string
}

const EVENT_LABELS: Record<string, EventLabels> = {
  "dota.pick_puck": { ru: "Пикнул Puck", en: "Pick Puck" },
  "dota.pick_sf": { ru: "Пикнул Shadow Fiend", en: "Pick Shadow Fiend" },
  "dota.pick_lina": { ru: "Пикнул Lina", en: "Pick Lina" },
  "dota.pick_void_spirit": { ru: "Пикнул Void Spirit", en: "Pick Void Spirit" },
  "dota.first_blood": { ru: "Первая кровь", en: "First Blood" },
  "dota.double_kill": { ru: "Дабл килл", en: "Double Kill" },
  "dota.triple_kill": { ru: "Трипл килл", en: "Triple Kill" },
  "dota.ultra_kill": { ru: "Ультра килл", en: "Ultra Kill" },
  "dota.rampage": { ru: "Рампага", en: "Rampage" },
  "dota.kills_20": { ru: "20 убийств", en: "20 Kills" },
  "dota.net_worth_10k_11": { ru: "Net worth 10k до 11 минуты", en: "Net worth 10k before 11m" },
  "dota.net_worth_20k": { ru: "Net worth 20k", en: "Net worth 20k" },
  "dota.net_worth_40k": { ru: "Net worth 40k", en: "Net worth 40k" },
  "dota.lh_minute_threshold": { ru: "Крипов 10×мин", en: "Last hits 10×min" },
  "dota.two_hours": { ru: "Игра 2 часа+", en: "Game 2 hours+" },
  "dota.buy_smoke": { ru: "Купил смока", en: "Bought smoke" },
  "dota.aegis": { ru: "Взял аегис", en: "Aegis picked" },
  "dota.cheese": { ru: "Взял сыр", en: "Cheese picked" },
  "dota.roshan_banner": { ru: "Взял знамя рошана", en: "Roshan banner picked" },
  "dota.refresher_shard": { ru: "Взял рефрешер с рошана", en: "Refresher shard picked" },
  "dota.win_streak": { ru: "Серия побед", en: "Win streak" },
  "dota.loss_streak": { ru: "Серия поражений", en: "Loss streak" },
}

export const getEventLabel = (eventKey: string | null | undefined, language: string) => {
  if (!eventKey) return null
  const labels = EVENT_LABELS[eventKey]
  if (!labels) return eventKey
  return language === "ru" ? labels.ru : labels.en
}
