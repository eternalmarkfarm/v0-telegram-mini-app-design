"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, XCircle } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useI18n } from "@/lib/i18n";
import { apiGet, apiPost } from "@/lib/api";
import { ensureAuth } from "@/lib/ensureAuth";

export default function LisSkinsSettingsPage() {
  const { language } = useI18n();
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [tokenInput, setTokenInput] = useState("");
  const [tokenSaved, setTokenSaved] = useState(false);
  const [tokenSaving, setTokenSaving] = useState(false);

  const [tradeUrl, setTradeUrl] = useState("");
  const [tradeSaving, setTradeSaving] = useState(false);
  const [tradeLinked, setTradeLinked] = useState(false);

  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [rangeSaving, setRangeSaving] = useState(false);
  const [rangeSaved, setRangeSaved] = useState(false);

  const load = async () => {
    setLoading(true);
    setErr(null);
    try {
      await ensureAuth();
      const [streamer, trade, settings] = await Promise.all([
        apiGet("/streamer/me"),
        apiGet("/streamer/lis-skins-trade-url"),
        apiGet("/streamer/lis-skins-settings"),
      ]);
      setTokenSaved(Boolean(streamer?.streamer?.lis_skins_token_set));
      const currentTradeUrl = trade?.trade_url ?? "";
      setTradeUrl(currentTradeUrl);
      setTradeLinked(Boolean(currentTradeUrl));
      if (typeof settings?.price_min === "number") {
        setPriceMin(String(settings.price_min));
      }
      if (typeof settings?.price_max === "number") {
        setPriceMax(String(settings.price_max));
      }
    } catch (e: any) {
      setErr(String(e?.message ?? e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const saveToken = async () => {
    if (!tokenInput.trim()) return;
    setTokenSaving(true);
    setErr(null);
    try {
      await ensureAuth();
      await apiPost("/streamer/lis-skins-token", { api_token: tokenInput.trim() });
      setTokenInput("");
      setTokenSaved(true);
    } catch (e: any) {
      setErr(String(e?.message ?? e));
    } finally {
      setTokenSaving(false);
    }
  };

  const saveTradeUrl = async () => {
    if (!tradeUrl.trim()) return;
    setTradeSaving(true);
    setErr(null);
    try {
      await ensureAuth();
      await apiPost("/streamer/lis-skins-trade-url", { trade_url: tradeUrl.trim() });
      setTradeLinked(true);
    } catch (e: any) {
      setErr(String(e?.message ?? e));
    } finally {
      setTradeSaving(false);
    }
  };

  const unlinkTradeUrl = async () => {
    setTradeSaving(true);
    setErr(null);
    try {
      await ensureAuth();
      await apiPost("/streamer/lis-skins-trade-url/unlink", {});
      setTradeLinked(false);
      setTradeUrl("");
    } catch (e: any) {
      setErr(String(e?.message ?? e));
    } finally {
      setTradeSaving(false);
    }
  };

  const saveRange = async () => {
    const minVal = Number(priceMin);
    const maxVal = Number(priceMax);
    if (!Number.isFinite(minVal) || !Number.isFinite(maxVal)) {
      setErr(language === "ru" ? "Введите корректный диапазон цен." : "Enter a valid price range.");
      return;
    }
    setRangeSaving(true);
    setRangeSaved(false);
    setErr(null);
    try {
      await ensureAuth();
      await apiPost("/streamer/lis-skins-settings", { price_min: minVal, price_max: maxVal });
      setRangeSaved(true);
    } catch (e: any) {
      setErr(String(e?.message ?? e));
    } finally {
      setRangeSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-background pb-8">
      <div className="mx-auto max-w-md px-4 py-4 space-y-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild className="shrink-0">
            <Link href="/streamer">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-lg font-bold text-foreground">
              {language === "ru" ? "Настройки Lis-Skins" : "Lis-Skins settings"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {language === "ru" ? "Покупка и выдача скинов Dota 2" : "Purchasing and delivering Dota 2 skins"}
            </p>
          </div>
        </div>

        {err && <div className="text-xs text-red-500">{err}</div>}

        <Card className="border-border/50 bg-card/80 backdrop-blur-sm p-4 space-y-2 text-sm text-muted-foreground">
          <p>
            {language === "ru"
              ? "Вы можете указать любую Steam trade ссылку. Лис‑Скинс купит и отправит Dota 2 скин по настройкам ниже."
              : "You can use any Steam trade link. Lis‑Skins will buy and deliver a Dota 2 skin based on the settings below."}
          </p>
          <p>
            {language === "ru"
              ? "Диапазон цен влияет на покупку скинов для розыгрышей."
              : "The price range controls which skins can be purchased for giveaways."}
          </p>
        </Card>

        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <h2 className="text-sm font-medium text-muted-foreground">
              {language === "ru" ? "API токен Lis‑Skins" : "Lis‑Skins API token"}
            </h2>
            {tokenSaved ? (
              <span className="text-xs text-success flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {language === "ru" ? "Сохранен" : "Saved"}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <XCircle className="h-3.5 w-3.5" />
                {language === "ru" ? "Не задан" : "Not set"}
              </span>
            )}
          </div>
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm p-4 space-y-3">
            <Input
              type="password"
              value={tokenInput}
              onChange={(e) => setTokenInput(e.target.value)}
              placeholder={language === "ru" ? "Вставьте API токен" : "Paste API token"}
              disabled={loading}
            />
            <Button onClick={saveToken} disabled={tokenSaving || !tokenInput.trim() || loading}>
              {tokenSaving ? (language === "ru" ? "Сохранение..." : "Saving...") : language === "ru" ? "Сохранить" : "Save"}
            </Button>
          </Card>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <h2 className="text-sm font-medium text-muted-foreground">
              {language === "ru" ? "Steam trade ссылка" : "Steam trade link"}
            </h2>
            {tradeLinked ? (
              <span className="text-xs text-success flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {language === "ru" ? "Привязана" : "Linked"}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <XCircle className="h-3.5 w-3.5" />
                {language === "ru" ? "Не привязана" : "Not linked"}
              </span>
            )}
          </div>
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm p-4 space-y-3">
            <Input
              value={tradeUrl}
              onChange={(e) => setTradeUrl(e.target.value)}
              placeholder="https://steamcommunity.com/tradeoffer/..."
              disabled={loading}
            />
            <div className="flex items-center gap-2">
              <Button onClick={saveTradeUrl} disabled={tradeSaving || !tradeUrl.trim() || loading}>
                {tradeSaving ? (language === "ru" ? "Сохранение..." : "Saving...") : language === "ru" ? "Привязать" : "Link"}
              </Button>
              {tradeLinked && (
                <Button variant="ghost" onClick={unlinkTradeUrl} disabled={tradeSaving}>
                  {language === "ru" ? "Отвязать" : "Unlink"}
                </Button>
              )}
            </div>
          </Card>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2 px-1">
            <h2 className="text-sm font-medium text-muted-foreground">
              {language === "ru" ? "Диапазон цен для Dota 2" : "Dota 2 price range"}
            </h2>
            {rangeSaved && (
              <span className="text-xs text-success flex items-center gap-1">
                <CheckCircle2 className="h-3.5 w-3.5" />
                {language === "ru" ? "Сохранено" : "Saved"}
              </span>
            )}
          </div>
          <Card className="border-border/50 bg-card/80 backdrop-blur-sm p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                className="no-spin"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                placeholder={language === "ru" ? "Мин. цена" : "Min price"}
                disabled={loading}
              />
              <Input
                type="number"
                className="no-spin"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                placeholder={language === "ru" ? "Макс. цена" : "Max price"}
                disabled={loading}
              />
            </div>
            <Button onClick={saveRange} disabled={rangeSaving || loading}>
              {rangeSaving ? (language === "ru" ? "Сохранение..." : "Saving...") : language === "ru" ? "Сохранить" : "Save"}
            </Button>
          </Card>
        </div>
      </div>
    </main>
  );
}
