# Session Log

## 2026-01-31

### Frontend / UI
- Added SWR-based background refresh on key pages so data updates without blocking navigation.
- Centralized refresh intervals in `app/prom/lib/refresh.ts` (prizes ~10s, others 15–30s).
- Fixed prize status column alignment by absolutely positioning status icons so they sit in a clean vertical stack across cards.
- Expanded Container Queries to stabilize layout across Telegram WebView scales:
  - Prize cards
  - Streamer cards (Streamers + Following)
  - Integrations block (stack to single column on narrow widths)
  - Viewer stats grid (streamer page)
  - Streamer stats panels (streamer cabinet)
  - Bottom navigation
- Stabilized streamer events UI by splitting into “Active / Inactive” sections to preserve ordering without jumpy reflow.

### Backend
- Fixed `/streamer/me` 500 error caused by missing columns in `dice_star_settlements`.
- Applied migration:
  - `commission_stars` and `net_stars` columns added with defaults.
- Verified `/streamer/me` returns 200 after restart; streamer events now persist across reloads.

### Process & Standards
- Added `AGENTS.md` with professional workflow principles:
  - Strategy + risks before changes
  - Preference for systemic solutions
  - Acceptance criteria template
  - UI/UX cross‑platform checklist
