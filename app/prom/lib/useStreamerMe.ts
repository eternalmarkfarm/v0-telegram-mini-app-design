"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { apiGet } from "@/lib/api";
import { ensureAuth } from "@/lib/ensureAuth";
import { buildCacheKey, readCache, writeCache } from "@/app/prom/lib/cache";

export type StreamerMe = {
  streamer?: {
    id: number;
    display_name?: string | null;
    twitch_login?: string | null;
    twitch_user_id?: string | null;
    twitch_linked_at?: string | null;
  } | null;
  events?: Array<{ event_key: string; enabled: boolean }>;
};

const CACHE_KEY = "prom:streamerMe";

export function useStreamerMe() {
  const cacheKey = useMemo(() => buildCacheKey(CACHE_KEY), []);
  const [data, setData] = useState<StreamerMe | null>(() => readCache<StreamerMe>(cacheKey));
  const [loading, setLoading] = useState<boolean>(!data);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      await ensureAuth();
      const res = await apiGet("/streamer/me");
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
    (next: Partial<StreamerMe>) => {
      setData((prev) => {
        const updated = { ...(prev ?? {}), ...next };
        writeCache(cacheKey, updated);
        return updated;
      });
    },
    [cacheKey],
  );

  return { data, loading, error, refresh, patch };
}
