export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE ??
  "https://nail-miniapp.duckdns.org";

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

async function apiRequest(path: string, opts: RequestInit = {}) {
  const headers = new Headers(opts.headers);

  const token = getToken();
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const r = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  if (!r.ok) throw new Error(await r.text());
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

export function apiPost(path: string, body?: any) {
  return apiRequest(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
}
