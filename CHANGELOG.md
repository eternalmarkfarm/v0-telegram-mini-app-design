# Changelog

## 2026-01-21
- Telegram winner notifications now trigger only after `steam_trade_offer_expiry_at` is present; tracked via `lis_skins_purchases.telegram_notified_at`.
- Added retry flow for LIS-Skins `trade_create_error`/`buy_error` with 5 attempts and 30s delay; streamer receives a Telegram alert after retries are exhausted with error reasons.
- Delivery status mapping updated for LIS-Skins return reasons (processing/not claimed/failed).
- Viewer timezone stored in `users.timezone` (default `Europe/Moscow`) and used for Telegram trade expiry formatting; mini-app sends timezone on auth and via `/viewer/timezone`.
- DB migrations added for notification and retry fields in `lis_skins_purchases`, plus `users.timezone`.

## 2026-01-22
- Added GSI net worth debug logging (`GSI_DEBUG_NET_WORTH=1`) and item price cache dependency notes for accurate net worth events.
- Prevented duplicate giveaway triggers after backend restarts by skipping already-logged GSI events for the same match.
- nginx now proxies `/api/*` to the backend, with HTTPS restored via Certbot and HTTP redirected to HTTPS.
