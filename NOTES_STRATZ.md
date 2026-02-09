# STRATZ Plan Snapshot (2026-02-08)

## Strategy
Use STRATZ for historical/player analytics (winrates, hero trends). Use Overwolf GEP for live in‑match data. Prefer client‑side STRATZ fetch (Overwolf) unless STRATZ whitelists server IP for S2S.

## Risks / Tradeoffs
- STRATZ server‑to‑server can be blocked by Cloudflare; client‑side works.
- STRATZ is not live match telemetry; it’s historical/aggregated.
- Data depends on player privacy (`isStratzPublic`).

## Mini‑Plan
1) Baseline winrate CLI (done).
2) Add top heroes (winrate + pick count) from `heroesPerformance`.
3) Overwolf client fetch for STRATZ (if no whitelist).
4) Integrate into mini‑app UI (list of 10 players -> winrate).

## Current Artifacts
- `backend/stratz/winrate.graphql`
- `backend/stratz/run_winrate.js`
- `stratz_enums.json`
- `stratz_input_types.json`
- `stratz_types.json`
- `stratz_types_more.json`
- `stratz_player_args.json`

## Notes
- Cloudflare block resolved when `User-Agent: STRATZ_API` + valid `STRATZ_TOKEN` are set.
- Server requests still may be challenged on some IPs; client fetch works reliably.
- Account ID example: SteamID64 76561197973671556 -> account_id 13405828.

