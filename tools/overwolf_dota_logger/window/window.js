/* global overwolf */
const MAX_LINES = 4000;
const logEl = document.getElementById("log");
const clearBtn = document.getElementById("clear");
const autoScrollEl = document.getElementById("autoScroll");

const lines = [];

function formatLine(entry) {
  const ts = entry.ts ?? new Date().toISOString();
  const level = (entry.level ?? "info").toUpperCase();
  const message = entry.message ?? "";
  let data = "";

  if (entry.data !== null && entry.data !== undefined) {
    try {
      data = JSON.stringify(entry.data, null, 2);
    } catch (err) {
      data = String(entry.data);
    }
  }

  if (data) {
    return `[${ts}] ${level} ${message}\n${data}\n`;
  }
  return `[${ts}] ${level} ${message}`;
}

function append(entry) {
  lines.push(formatLine(entry));
  if (lines.length > MAX_LINES) {
    lines.splice(0, lines.length - MAX_LINES);
  }
  logEl.textContent = lines.join("\n");

  if (autoScrollEl.checked) {
    logEl.scrollTop = logEl.scrollHeight;
  }
}

overwolf.windows.onMessageReceived.addListener((message) => {
  if (!message || message.type !== "log") {
    return;
  }
  append(message);
});

clearBtn.addEventListener("click", () => {
  lines.length = 0;
  logEl.textContent = "";
});

append({
  level: "info",
  message: "window_ready",
  data: { maxLines: MAX_LINES },
  ts: new Date().toISOString()
});
