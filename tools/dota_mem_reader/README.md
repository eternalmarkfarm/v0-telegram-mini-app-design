# Dota 2 Memory Reader (Console)

Read-only console tool. Prints account_id for up to 10 players using patterns from `patterns.json`.

## One-time collection (no manual patterns)
If you don’t want to deal with patterns:
1) Build the tool
2) Run **collector mode** once to generate `collector_output`:

```
.\build\Release\dota_mem_reader.exe --collect --out collector_output
```

It writes:
- `collector_output\client.dll`
- `collector_output\info.txt`

Send `collector_output` to generate `patterns.json` for you.

## Patterns required
- `player_resource.pattern`: AOB signature in `client.dll`
- `player_resource.offset`: byte offset to the RIP-relative displacement (or absolute address offset)
- `player_resource.relative`: `true` if RIP-relative, `false` if absolute
- `player_steamid_offset`: offset inside `C_DOTA_PlayerResource` for `m_iPlayerSteamID[0]`
- `player_steamid_stride`: 8
- `max_players`: 10

## Usage
1) Place `patterns.json` next to the exe
2) Run:

```
.\build\Release\dota_mem_reader.exe
```

The tool prints per-slot SteamID64 + account_id.

## Notes
- If `steamid64` is zero or invalid, that slot is empty.
- Run the console as Administrator if `OpenProcess` fails.
