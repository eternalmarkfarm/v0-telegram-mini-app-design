"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiPost, getToken } from "@/lib/api";

function CallbackInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const code = sp.get("code");
    const state = sp.get("state");

    const token = getToken();
    if (!token) {
      setError("Нет токена приложения. Сначала залогинься (Telegram login или Dev login).");
      return;
    }

    if (!code || !state) {
      setError("В URL нет code/state. Проверь, что Twitch редиректит на /twitch/callback");
      return;
    }

    (async () => {
      try {
        await apiPost("/twitch/exchange", { code, state });
        router.replace("/streamer");
      } catch (e: any) {
        setError(e?.message ?? String(e));
      }
    })();
  }, [sp, router]);

  return (
    <div style={{ padding: 16 }}>
      <h1>Привязка Twitch…</h1>
      {error ? (
        <pre style={{ whiteSpace: "pre-wrap" }}>{error}</pre>
      ) : (
        <p>Жди, выполняю обмен кода…</p>
      )}
    </div>
  );
}

export default function TwitchCallbackPage() {
  return (
    <Suspense fallback={<div style={{ padding: 16 }}>Загрузка…</div>}>
      <CallbackInner />
    </Suspense>
  );
}
