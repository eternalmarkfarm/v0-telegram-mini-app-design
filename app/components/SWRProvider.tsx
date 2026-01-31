"use client";

import type { ReactNode } from "react";
import { SWRConfig } from "swr";
import { apiGetFresh } from "@/lib/api";
import { ensureAuth } from "@/lib/ensureAuth";

const AUTHTED_PREFIXES = ["/viewer", "/streamer", "/giveaways"];

const isAuthedPath = (key: string) =>
  AUTHTED_PREFIXES.some((prefix) => key.startsWith(prefix));

export default function SWRProvider({ children }: { children: ReactNode }) {
  return (
    <SWRConfig
      value={{
        revalidateOnFocus: false,
        refreshWhenHidden: false,
        dedupingInterval: 5000,
        fetcher: async (key: string) => {
          if (typeof key !== "string") return null;
          if (isAuthedPath(key)) {
            await ensureAuth();
          }
          return apiGetFresh(key);
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}
