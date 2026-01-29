"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { ensureAuth } from "@/lib/ensureAuth";
import { buildCacheKey, readCache, writeCache } from "@/app/prom/lib/cache";

export type ViewerStatus = {
  telegram_id?: string | number | null;
  twitch_user_id?: string | null;
  twitch_login?: string | null;
  twitch_linked_at?: string | null;
  steam_trade_url?: string | null;
};

const CACHE_KEY = "prom:viewer";

export function useViewerStatus() {
  const cacheKey = useMemo(() => buildCacheKey(CACHE_KEY), []);
  const [data, setData] = useState<ViewerStatus | null>(() => readCache<ViewerStatus>(cacheKey));
  const [loading, setLoading] = useState<boolean>(!data);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      await ensureAuth();
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || "Europe/Moscow";
      apiPost("/viewer/timezone", { timezone }).catch(() => {});
      const res = await apiGet("/viewer/me");
      setData(res);
      writeCache(cacheKey, res);
    } catch (e: any) {
      setError(String(e?.message ?? e));
    } finally {
      setLoading(false);
    }
  }, [cacheKey]);

  useEffect(() => {
    refresh();
    const onFocus = () => refresh();
    window.addEventListener("focus", onFocus);
    const onVisibility = () => {
      if (document.visibilityState === "visible") refresh();
    };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [refresh]);

  const patch = useCallback(
    (next: Partial<ViewerStatus>) => {
      setData((prev) => {
        const updated = { ...(prev ?? {}), ...next };
        writeCache(cacheKey, updated);
        return updated;
      });
    },
    [cacheKey],
  );

  const twitchLinked = Boolean(data?.twitch_user_id);
  const steamLinked = Boolean(data?.steam_trade_url);

  return {
    data,
    loading,
    error,
    refresh,
    patch,
    twitchLinked,
    steamLinked,
    twitchLogin: data?.twitch_login ?? null,
  };
}
