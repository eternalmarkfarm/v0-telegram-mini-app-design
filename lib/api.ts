export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "/api";

export class ApiError extends Error {
  status: number;
  url: string;
  bodyText: string;

  constructor(message: string, status: number, url: string, bodyText: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.url = url;
    this.bodyText = bodyText;
  }
}

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export function setToken(token: string) {
  localStorage.setItem("token", token);
}

export function removeToken() {
  localStorage.removeItem("token");
}

let telegramAuthInFlight: Promise<string> | null = null;

export async function authTelegram(initData: string, timezone?: string): Promise<string> {
  const r = await fetch(`${API_BASE}/auth/telegram`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ initData, timezone }),
  });
  const text = await r.text();
  if (!r.ok) throw new ApiError(text || "Telegram auth failed", r.status, `${API_BASE}/auth/telegram`, text);

  let payload: any;
  try {
    payload = JSON.parse(text);
  } catch {
    throw new ApiError("Telegram auth returned invalid JSON", r.status, `${API_BASE}/auth/telegram`, text);
  }

  const token = payload?.token;
  if (!token) throw new ApiError("Telegram auth returned no token", 502, `${API_BASE}/auth/telegram`, text);
  setToken(token);
  return token;
}

async function tryReauthFromTelegram(): Promise<string | null> {
  if (typeof window === "undefined") return null;
  const initData = (window as any)?.Telegram?.WebApp?.initData;
  if (!initData) return null;

  if (!telegramAuthInFlight) {
    telegramAuthInFlight = authTelegram(initData).finally(() => {
      telegramAuthInFlight = null;
    });
  }
  return telegramAuthInFlight;
}

async function apiRequest(path: string, opts: RequestInit = {}, allowRetry = true) {
  const buildHeaders = () => {
    const headers = new Headers(opts.headers);
    const token = getToken();
    if (token && !headers.has("Authorization")) headers.set("Authorization", `Bearer ${token}`);
    return headers;
  };

  const r = await fetch(`${API_BASE}${path}`, { ...opts, headers: buildHeaders() });
  if (r.status === 401 && allowRetry) {
    // Session can expire server-side. If we still have Telegram initData, re-auth and retry once.
    removeToken();
    const newToken = await tryReauthFromTelegram();
    if (newToken) {
      const r2 = await fetch(`${API_BASE}${path}`, { ...opts, headers: buildHeaders() });
      if (!r2.ok) {
        const text = await r2.text();
        throw new ApiError(text || "Request failed", r2.status, `${API_BASE}${path}`, text);
      }
      return r2.json();
    }
  }

  if (!r.ok) {
    const text = await r.text();
    throw new ApiError(text || "Request failed", r.status, `${API_BASE}${path}`, text);
  }
  return r.json();
}

export function apiGet(path: string) {
  // Add timestamp to prevent caching (aggressive cache busting)
  const separator = path.includes("?") ? "&" : "?";
  const pathWithTs = `${path}${separator}_t=${Date.now()}`;

  return apiRequest(pathWithTs, {
    method: "GET",
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Pragma": "no-cache"
    }
  });
}

export function apiGetFresh(path: string) {
  const separator = path.includes("?") ? "&" : "?";
  const pathWithTs = `${path}${separator}_t=${Date.now()}`;

  return apiRequest(pathWithTs, {
    method: "GET",
    cache: "no-store",
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate",
      "Pragma": "no-cache",
    },
  });
}

export function apiPost(path: string, body?: any) {
  return apiRequest(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
}

export function apiDelete(path: string) {
  return apiRequest(path, {
    method: "DELETE",
  });
}
