StreamDrop Dota Logger (Overwolf)

Purpose
- Logs roster + match_info info updates.
- Logs every event payload that the Game Events Platform emits.
- No server calls. Output stays in the app window.

How to run
1) Install Overwolf and enable Developer Mode.
2) In Overwolf Developer settings, load an unpacked app:
   - Folder: tools/overwolf_dota_logger
3) Launch Dota 2 and start a match.
4) Keep the log window open. It stays on top by default.

What you will see
- gameInfo / runningChanged notifications.
- match_info updates.
- roster updates.
- events with their raw payloads.

Notes
- The manifest targets game_id 7314 (Dota 2). If Overwolf on your machine uses a different ID,
  edit tools/overwolf_dota_logger/manifest.json and update game_ids.
- If you need to verify the game ID, check Overwolf's Games list in the dev tools or
  inspect the local GamesList.xml.

Files
- manifest.json
- background/* (event subscriptions)
- window/* (log UI)
