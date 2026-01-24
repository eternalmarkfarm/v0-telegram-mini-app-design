# LOGIC_MAP

This document is the canonical logic map for the project. Any future change should be checked against this map and the check-list at the bottom.

## High-Level Flow
1) Client sends GSI payloads to backend `/gsi`.
2) GSI payload is processed by EventEngine.
3) Event keys are emitted from the engine and logged into `gsi_events_log`.
4) Giveaways are triggered for each logged event.
5) LIS-Skins purchases are made, statuses are tracked, and Telegram notifications are sent.

## GSI Ingest and Event Pipeline

### Entry Point
- File: `backend/backendDrop/app.py`
- Endpoint: `POST /gsi`
- Expected:
  - Query param `streamer_id`
  - Payload with `auth.token` matching `GSI_INGEST_SECRET`

### Event Detection
- Engine: `backend/backendDrop/GSI/dotadrop/event_engine.py`
- `engine.process(payload)` returns `instant` and `endgame` events.
- `instant` messages are converted to event keys by `_event_key_from_message`.

### Event Logging Rules
- Function: `_log_gsi_event` in `backend/backendDrop/app.py`
- Default behavior:
  - One event per `(streamer_id, event_key, match_id)` is allowed.
- Exception (repeatable per match):
  - `dota.double_kill`
  - `dota.triple_kill`
  - `dota.ultra_kill`
  - `dota.rampage`

### Repeatable vs One-time Events
- Repeatable (per match):
  - `dota.double_kill`
  - `dota.triple_kill`
  - `dota.ultra_kill`
  - `dota.rampage`
- One-time (per match):
  - `dota.buy_smoke`
  - `dota.aegis`
  - `dota.cheese`
  - `dota.roshan_banner`
  - `dota.refresher_shard`
  - `dota.net_worth_10k_before_11`
  - `dota.net_worth_20k`
  - `dota.net_worth_40k`
  - `dota.lh_minute_threshold`
  - `dota.kills_20`
  - `dota.two_hours`
  - `dota.first_blood`
  - `dota.pick_*` (hero pick events)

### GSI Payload Logging (Root Cause Analysis)
- Table: `gsi_payload_log`
- Purpose: post-mortem of why an event fired or did not fire.
- Logged fields (from payload and engine snapshot):
  - `match_id`, `game_time`, `player_kills`, `game_state`, `hero_name`
  - `engine_state` (multikill window and last kill time)
  - Optional full `payload`
- Env flags (systemd EnvironmentFile must be used):
  - `GSI_PAYLOAD_LOG_SAMPLE_RATE` (0..1)
  - `GSI_PAYLOAD_LOG_RAW` (0/1)
  - `GSI_PAYLOAD_LOG_ALWAYS_ON_EVENT` (0/1)
  - `GSI_PAYLOAD_RETENTION_DAYS`
- Cleanup:
  - Weekly cleanup task deletes entries older than `GSI_PAYLOAD_RETENTION_DAYS`.

## Giveaways

### Triggering
- Source: `backend/backendDrop/app.py`
- `giveaway_trigger` called after event is logged to `gsi_events_log`.
- Checks `streamer_events.enabled` and other settings (price ranges, winners count).

### Eligibility (Viewer)
- Viewer must:
  - Track streamer
  - Follow streamer
  - Have recent chat activity (EventSub)

## LIS-Skins Purchases
- Base URL: `https://api.lis-skins.com/v1`
- Table: `lis_skins_purchases` + `lis_skins_status_log`
- Retry: up to 5 attempts, 30s delay.
- Telegram notify only after `steam_trade_offer_expiry_at` is set.

## Twitch EventSub
- WebSocket subscriptions for `channel.chat.message`.
- Used for eligibility and activity checks.
 - WebSocket subscriptions for `channel.follow` (version 2) to collect daily follower stats.

## Followers Analytics
- Table: `twitch_follows` (one row per broadcaster+follower).
- Dashboard:
  - `/streamer/followers/today` provides today's count.
  - `/streamer/followers/stats` provides 5/15/30 day series.
- If no data is available, UI shows "Not enough data".

## Telegram
- Notifications after LIS-Skins trade expiry is known.
- Viewer timezone is used for expiry formatting.

## Important Tables
- `gsi_events_log` (event-level log)
- `gsi_payload_log` (payload-level log for RCA)
- `streamer_events` (config, enabled, winners_count, price ranges)
- `giveaways`, `giveaway_rewards`
- `lis_skins_purchases`, `lis_skins_status_log`
- `viewer_twitch_status`, `viewer_tracked_streamers`

## Pre-Change Check List

1) Does the change affect event dedup?
   - Confirm repeatable events remain repeatable.
   - Confirm one-time events remain one-time.

2) Does the change affect GSI processing?
   - Verify `engine.process()` still emits correct events.
   - Check `game_time` and `player_kills` are available in payload.

3) Does the change affect logging?
   - Ensure `gsi_events_log` still logs events.
   - Ensure `gsi_payload_log` is populated when enabled.

4) Does the change affect giveaways?
   - `giveaway_trigger` should still run for logged events.
   - Confirm streamer event config is respected.

5) Does the change affect LIS-Skins flow?
   - Retry logic and status mapping remain intact.
   - Telegram notify timing remains correct.

6) Does the change affect Twitch/eligibility?
   - Chat activity and follow checks still enforced.

7) Deployment configuration checks:
   - systemd `EnvironmentFile` points to `.env`
   - `.env` has no inline comments on env lines

8) RCA readiness:
   - `gsi_payload_log` has entries with `payload` and `engine_state`
   - retention cleanup runs weekly
