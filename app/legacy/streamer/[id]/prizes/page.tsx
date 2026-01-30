import StreamerPrizesClient from "./prizes-client";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE ?? "https://nail-miniapp.duckdns.org";

export async function generateStaticParams() {
  try {
    const resp = await fetch(`${API_BASE}/streamers`, { cache: "no-store" });
    if (!resp.ok) return [];
    const data = await resp.json();
    const streamers = Array.isArray(data?.streamers) ? data.streamers : [];
    return streamers.map((s: any) => ({ id: String(s.id) }));
  } catch {
    return [];
  }
}

export default function StreamerPrizesPage({ params }: { params: { id: string } }) {
  return <StreamerPrizesClient id={params.id} />;
}
