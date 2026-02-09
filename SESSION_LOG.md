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

## 2026-02-01

### Backend (backendDrop repo)
- Implemented Steam inventory privacy checks and reroll logic:
  - Added helpers `_is_steam_inventory_public` and `_notify_private_inventory` in `backend/backendDrop/app.py`.
  - `/viewer/steam` now checks inventory right after saving trade URL; if private, sends Telegram bot warning to the user.
  - `giveaway_trigger` now skips winners with private inventories, notifies them in Telegram, and rerolls another eligible viewer.
- Lis‑Skins robustness:
  - Continued logging of 400 bodies (e.g., `{"error":"private_inventory"}`) for failed buys.
  - Retry logic already avoids reusing bad `item_id`s and refetches skins on 400.
- Local commit created: `check steam inventory privacy and skip on giveaways`.
- Push failed due to missing network access in this environment; needs manual push:
  - `git -C /home/quant/src/v0-telegram-mini-app-design/backend/backendDrop push`
- Server deploy steps (after push):
  - `cd /home/user/miniapp-backend`
  - `git pull`
  - `sudo systemctl restart miniapp-backend`

### Lis‑Skins / Giveaway Debug
- Observed buy failures for event triggers due to `private_inventory` in Lis‑Skins response.
- Example affected viewer: `twitch_login=bobich262626`, `steam_trade_url` present, inventory private.
- DB evidence:
  - `lis_skins_status_log.payload` showed `error: "private_inventory"` and `return_reason: "trade_create_error"`.
  - `lis_skins_purchases` status stuck in `return`/`processing`.

### iOS WebView Issue (unresolved)
- iOS Telegram WebView sometimes shows missing bottom‑nav background on launch; appears after 15–20s.
- Black screen for ~15–20s when app is backgrounded then resumed.
- Already attempted:
  - `--app-height` handling via `visualViewport`, `viewport_changed` and `pageshow/visibilitychange` listeners.
  - `prom-bottom-nav-fallback` layer and GPU hinting for nav.
  - forced repaint via `ios-repaint` class.
- Issue persists; needs deeper iOS WebView research/solution.

### Notes for next session
- If giveaway fails to trigger, check Lis‑Skins error body and `private_inventory` logs.
- After backend deploy, verify:
  - inventory warning is sent on trade URL save,
  - winners with private inventory are skipped and rerolled,
  - giveaways proceed without manual intervention.

### Root‑cause: repeated winners (recent_ids empty)
- Logs for 16:10–16:14 show `recent_ids=[]` despite eligible_count=3.
- Cause confirmed: race condition + late reward creation.
  - `recent_ids` were read before `giveaway_rewards` rows were created.
  - When purchases failed, rewards were never created, keeping `recent_ids` empty.
- Fix applied in code: reserve winners by creating `giveaway_rewards` immediately with `pending`, then update after purchase.
  - This removes the race and keeps `recent_ids` populated even if purchase fails.

## 2026-02-02

### Concept Discussion: E-sports Prediction Market (Polymarket-style)
- **Idea**: Creating a trading platform for Dota 2 / CS2 match outcomes inside a Telegram Mini App.
- **Key Difference**: Trading "Shares" (probability 0-100%) instead of binary betting. Users can sell positions mid-match.
- **Architecture Vision**:
  - **Oracles**: Real-time data from PandaScore/Grid/Valve APIs.
  - **Engine**: Hybrid approach recommended (Off-chain matching for UX speed, On-chain TON for settlement) vs Pure On-chain.
  - **UI**: Live match charts, "Portfolio" instead of betting slip.
- **Legal & Compliance Risks**:
  - **Gambling License**: Required for real-money operations in most jurisdictions.
  - **App Store/Google Play**: Strict anti-gambling policies; risk of app removal.
  - **Strategy**: Often starts as "DeFi protocol" (smart contracts only, no centralized backend money handling) with Geo-blocking (e.g., USA) and optional KYC for larger amounts.

## 2026-02-03 & 04

### Planning: CyberSport Prediction Market (Deep Dive)
- **Core Concept**: P2P Trading (Polymarket-style) for Streamer matches.
- **Economic Loop**:
  - `Stars` (In-App Purchase) -> `Credits` (In-Game Currency).
  - `Credits` -> **Prediction Market** (Multiply capital).
  - `Credits` -> **Super Drop Tickets** (Burn for Weekly Skin Raffle).
  - *Key*: No direct cash-out. Solves Store compliance.
- **Data Strategy (The "Oracle" Problem)**:
  - **Verdict**: Use **Game State Integration (GSI)**.
  - *Why*: Steam GC has 2-min delay (unusable). Twitch has 15s delay. GSI is instant (0ms).
  - *Scope*: GSI provides Match Winner & Score. It does *not* provide full Enemy Inventory (Fog of War), so complex AI probabilities are abandoned in favor of pure P2P pricing.
- **Gamification Layer**:
  - Hiding "Order Book" complexity behind a "Tug of War" (Boost/Crush) UI.
  - **Leagues**: Rank based on trading profit (MMR). Top ranks get free Drop Tickets.
  - **Social**: "Copy Trading" (Follow Whales) and PVP Duels.
## STRATZ Plan
- Notes: `NOTES_STRATZ.md`
