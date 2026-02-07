/* global overwolf */
const DOTA2_GAME_ID = 7314;
const LOG_WINDOW = "log_window";
const FEATURES = [
  "roster",
  "match_info",
  "assist",
  "death",
  "cs",
  "xpm",
  "gpm",
  "gold",
  "hero_leveled_up",
  "hero_respawned",
  "hero_buyback_info_changed",
  "hero_boughtback",
  "hero_health_mana_info",
  "hero_status_effect_changed",
  "hero_attributes_skilled",
  "hero_ability_skilled",
  "hero_ability_used",
  "hero_ability_cooldown_changed",
  "hero_ability_changed",
  "hero_item_cooldown_changed",
  "hero_item_changed",
  "hero_item_used",
  "hero_item_consumed",
  "hero_item_charged",
  "damage"
];

let featuresSet = false;

function sendLog(level, message, data) {
  const payload = {
    type: "log",
    level,
    message,
    data: data ?? null,
    ts: new Date().toISOString()
  };

  overwolf.windows.sendMessage(LOG_WINDOW, payload, () => {});
}

function handleGameInfo(gameInfo) {
  if (!gameInfo || !gameInfo.isRunning || !gameInfo.gameId) {
    featuresSet = false;
    return;
  }

  if (gameInfo.gameId !== DOTA2_GAME_ID) {
    return;
  }

  if (!featuresSet) {
    overwolf.games.events.setRequiredFeatures(FEATURES, (result) => {
      featuresSet = result && result.status === "success";
      sendLog("info", "setRequiredFeatures", result);
    });
  }
}

overwolf.games.onGameInfoUpdated.addListener((event) => {
  if (!event) {
    return;
  }

  if (event.gameInfo) {
    sendLog("info", "gameInfo", event.gameInfo);
    handleGameInfo(event.gameInfo);
  }

  if (event.runningChanged) {
    sendLog("info", "runningChanged", event.runningChanged);
  }
});

overwolf.games.onGameLaunched.addListener((event) => {
  sendLog("info", "gameLaunched", event);
  if (event && event.gameId === DOTA2_GAME_ID) {
    handleGameInfo({
      gameId: event.gameId,
      isRunning: true
    });
  }
});

overwolf.games.onGameClosed.addListener((event) => {
  sendLog("info", "gameClosed", event);
  featuresSet = false;
});

overwolf.games.events.onInfoUpdates2.addListener((event) => {
  if (!event || !event.info) {
    return;
  }

  if (event.info.match_info) {
    sendLog("data", "match_info", event.info.match_info);
  }

  if (event.info.roster) {
    sendLog("data", "roster", event.info.roster);
  }

  const keys = Object.keys(event.info).filter((key) => key !== "match_info" && key !== "roster");
  if (keys.length > 0) {
    sendLog("data", "info_updates_other", { keys, info: event.info });
  }
});

overwolf.games.events.onNewEvents.addListener((event) => {
  if (!event || !event.events) {
    return;
  }

  event.events.forEach((evt) => {
    sendLog("event", evt.name, evt.data ?? null);
  });
});

overwolf.games.events.onError.addListener((event) => {
  sendLog("error", "eventsError", event);
});

sendLog("info", "background_started", { features: FEATURES });
