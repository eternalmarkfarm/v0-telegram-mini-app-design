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
  return apiRequest(path, { method: "GET" });
}

export function apiPost(path: string, body?: any) {
  return apiRequest(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
}
