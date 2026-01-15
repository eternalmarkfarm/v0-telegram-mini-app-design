"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { apiPost } from "@/lib/api";
import { ensureAuth } from "@/lib/ensureAuth";
import { Card } from "@/components/ui/card";

function CallbackInner() {
  const sp = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<"processing" | "success" | "error">("processing");
  const [message, setMessage] = useState("Processing Twitch OAuth...");

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // We try ensureAuth, but if it fails (external browser), we proceed anyway
        // because the backend now trusts the 'state' parameter for identification.
        try {
          await ensureAuth();
        } catch (e) {
          console.log("Not in Telegram or no initData, proceeding with state-based auth...");
        }

        // Get parameters from URL
        const code = sp.get("code");
        const state = sp.get("state");
        const error = sp.get("error");

        if (error) {
          throw new Error(`Twitch OAuth error: ${error}`);
        }

        if (!code || !state) {
          throw new Error("Missing code or state parameter");
        }

        // Используем универсальный эндпоинт - type читается из state на бэкенде
        const result = await apiPost("/twitch/exchange-universal", { code, state });
        setStatus("success");
        const userType = result?.type === "streamer" ? "Streamer" : "Viewer";
        setMessage(`✅ Twitch ${userType} account linked successfully! You can close this window and return to Telegram.`);
      } catch (e: any) {
        setStatus("error");
        setMessage(`❌ Error: ${e?.message ?? e}`);
      }
    };

    handleCallback();
  }, [sp, router]);

  return (
    <main className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-6 text-center">
        <div className="mb-4">
          {status === "processing" && (
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          )}
          {status === "success" && <div className="text-6xl">✅</div>}
          {status === "error" && <div className="text-6xl">❌</div>}
        </div>
        <p className="text-lg text-foreground">{message}</p>
        {status === "success" && (
          <p className="text-sm text-muted-foreground mt-2">Redirecting...</p>
        )}
        {status === "error" && (
          <button
            onClick={() => router.push("/")}
            className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-md"
          >
            Return to Home
          </button>
        )}
      </Card>
    </main>
  );
}

export default function TwitchCallbackPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-background flex items-center justify-center">
        <p>Loading...</p>
      </main>
    }>
      <CallbackInner />
    </Suspense>
  );
}
