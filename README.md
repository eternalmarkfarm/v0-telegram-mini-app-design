# Telegram mini app design

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/nksepte-7245s-projects/v0-telegram-mini-app-design)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/eduP3gEJd9d)

## Overview

This repository will stay in sync with your deployed chats on [v0.app](https://v0.app).
Any changes you make to your deployed app will be automatically pushed to this repository from [v0.app](https://v0.app).

## Deployment

Your project is live at:

**[https://vercel.com/nksepte-7245s-projects/v0-telegram-mini-app-design](https://vercel.com/nksepte-7245s-projects/v0-telegram-mini-app-design)**

## Build your app

Continue building your app on:

**[https://v0.app/chat/eduP3gEJd9d](https://v0.app/chat/eduP3gEJd9d)**

## How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

## Project Structure and Architecture

This is a Next.js 16 (App Router) frontend plus a FastAPI backend. The app is a Telegram Mini App for Dota 2 giveaways using Twitch + Steam linking and Lis-Skins purchases.

### Stack
Frontend:
- Next.js 16 + React 19, Tailwind CSS v4
- Local i18n context (ru/en)
- Telegram WebApp SDK

Backend:
- FastAPI (single `app.py`)
- PostgreSQL
- Twitch EventSub (WebSocket transport)
- Dota 2 GSI ingestion + custom event engine
- Lis-Skins API integration

### Frontend Routes
- `app/page.tsx`: Viewer home (public stats, recent prizes, tracked streamers)
- `app/prizes/page.tsx`: Viewer prize history (full list)
- `app/rules/page.tsx`: Participation rules
- `app/live/page.tsx`: Live streamers
- `app/tracked/page.tsx`: Tracked streamers management
- `app/streamer/page.tsx`: Streamer dashboard
- `app/streamer/events/page.tsx`: Streamer event settings
- `app/streamer/lis-skins/page.tsx`: Lis-Skins settings + test purchase
- `app/streamer/[id]/page.tsx`: Viewer streamer page
- `app/streamer/[id]/prizes/page.tsx`: Streamer prizes list
- `app/twitch/callback/page.tsx`: Twitch OAuth callback

### Key UI Components
- `components/account-linking.tsx`: Twitch + Steam linking UI
- `components/statistics.tsx`: Public stats (total prizes, total amount)
- `components/recent-prizes.tsx`: Last 3 prizes across all streamers
- `components/my-prizes.tsx`: Viewer prize list block and /prizes page
- `components/tracked-streamers.tsx`, `components/live-streamers.tsx`

### Backend Responsibilities
GSI:
- `POST /gsi` ingests Dota 2 GSI payloads.
- `EventEngine` turns payloads into event keys.
- GSI installer is generated as a Windows-safe `.cmd` that writes a UTF-8-no-BOM `.cfg`.

Giveaways:
- `POST /giveaways/trigger` selects winners, buys skins via Lis-Skins, logs results.
- Viewer eligibility requires: tracked streamer, follower, and chat message (EventSub).

Lis-Skins:
- Base URL `https://api.lis-skins.com/v1`
- Cursor pagination for search
- `unlock_days=[0]`, `only_unlocked=1`, `game=dota2`
- Purchases logged in `lis_skins_purchases` + status log.

Twitch:
- Viewer and streamer OAuth flows.
- EventSub WebSocket subscriptions for `channel.chat.message`.
- Follower checks via Helix.

Public:
- `GET /public/stats` (global stats)
- `GET /public/recent-prizes` (last 3 prizes)

### Important Tables
- `users`, `sessions`
- `streamers`, `streamer_events`
- `giveaways`, `giveaway_rewards`
- `viewer_tracked_streamers`, `viewer_twitch_status`
- `gsi_events_log`
- `lis_skins_purchases`, `lis_skins_status_log`

### Notes
- UI auto-refreshes key blocks (stats, recent prizes, streamer profile).
- `-gamestateintegration` launch option is required for GSI.
- `streamer_id` is validated against owner when hitting streamer-only endpoints.

### Recent Changes (2026-01-19)
- Twitch OAuth Android hardening: short link endpoints, HTML 200 redirect with base64 URL, and optional "Open in Chrome" intent button.
- Added one-time OAuth link codes table: `oauth_link_codes` (created on startup).
- Auto-refresh LIS-Skins purchase statuses in background (`LIS_REFRESH_INTERVAL_SECONDS`, `LIS_REFRESH_STALE_SECONDS`).
- EventSub subscription refresh on 401/403 and safer reconnect loop delay.
- Participant eligibility now requires chat activity within 1 hour (viewer list + giveaway selection).
- "Check eligibility" reasons and "All participants" page added for streamer viewers.
- Rules page: bullet conditions, app icons, trade URL steps, and events list page.
- StreamElements: settings + test message; chat messages only after successful purchase.
- OBS config package: includes overlay HTML + assets, demo mode, and RU readme.
- "Live" badge with pulse added to streamer cards; stream participants count now based on eligibility.
- Streamer delete keeps historical stats; tracked list hides deleted streamers.

### Server Deploy Cheatsheet
Frontend (on server):
```
cd /home/user/apps/v0-telegram-mini-app-design
git pull
npm run build
pm2 restart miniapp
```

Backend (on server):
```
cd /home/user/miniapp-backend
git pull
sudo systemctl restart miniapp-backend
sudo journalctl -u miniapp-backend -f
```

### DB Migrations (manual)
Examples used in this project:
```
-- Add Telegram channel URL for streamers
ALTER TABLE streamers
ADD COLUMN telegram_channel_url TEXT;

-- Telegram notify trigger for LIS-Skins trade expiry
ALTER TABLE lis_skins_purchases
ADD COLUMN telegram_notified_at TIMESTAMPTZ;

-- Retry controls for LIS-Skins trade creation failures
ALTER TABLE lis_skins_purchases
ADD COLUMN retry_count INT NOT NULL DEFAULT 0;

ALTER TABLE lis_skins_purchases
ADD COLUMN last_retry_at TIMESTAMPTZ;

-- Store viewer timezone (used for Telegram notifications)
ALTER TABLE users
ADD COLUMN timezone TEXT;

-- Optional: prevent sending notifications for historical purchases
-- (run once right after adding the column)
UPDATE lis_skins_purchases
SET telegram_notified_at = now()
WHERE steam_trade_offer_expiry_at IS NOT NULL
  AND telegram_notified_at IS NULL;

-- Remove deprecated event
DELETE FROM streamer_events WHERE event_key = 'dota.lh_per_min_10';

-- Seed new events for all streamers
INSERT INTO streamer_events (streamer_id, event_key, enabled, winners_count)
SELECT s.id, v.event_key, true, 1
FROM streamers s
CROSS JOIN (VALUES
  ('dota.lh_minute_threshold'),
  ('dota.net_worth_20k'),
  ('dota.buy_smoke'),
  ('dota.aegis'),
  ('dota.cheese'),
  ('dota.roshan_banner'),
  ('dota.refresher_shard')
) AS v(event_key)
ON CONFLICT (streamer_id, event_key) DO NOTHING;
```

### GSI Health Checklist
1) GSI config file in:  
   `C:\steam\steamapps\common\dota 2 beta\game\dota\cfg\gamestate_integration\`
2) File name must be:  
   `gamestate_integration_*.cfg`
3) `uri` points to correct `streamer_id`
4) Steam launch option includes:  
   `-gamestateintegration`
5) Backend logs show:  
   `GSI payload received for streamer_id=...`

### Lis-Skins Integration Notes
- Base URL: `https://api.lis-skins.com/v1`
- Auth header: `Authorization: Bearer <API_KEY>`
- Search uses cursor pagination via `meta.next_cursor`
- Use `unlock_days=[0]` + `only_unlocked=1` to avoid trade-locked skins
- Market search can be delayed; WS/JSON prices are faster if needed
