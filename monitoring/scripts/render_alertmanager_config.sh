#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
ENV_FILE="${1:-$ROOT_DIR/.env}"
TEMPLATE_FILE="$ROOT_DIR/alertmanager/alertmanager.template.yml"
OUTPUT_FILE="$ROOT_DIR/alertmanager/alertmanager.generated.yml"

if [ ! -f "$ENV_FILE" ]; then
  echo "Missing env file: $ENV_FILE" >&2
  exit 1
fi

if [ ! -f "$TEMPLATE_FILE" ]; then
  echo "Missing template file: $TEMPLATE_FILE" >&2
  exit 1
fi

BOT_TOKEN="$(grep '^ALERTMANAGER_TG_BOT_TOKEN=' "$ENV_FILE" | cut -d= -f2- || true)"
CHAT_ID="$(grep '^ALERTMANAGER_TG_CHAT_ID=' "$ENV_FILE" | cut -d= -f2- || true)"

# Accept optional quoting in .env and normalize to raw values.
BOT_TOKEN="$(printf '%s' "$BOT_TOKEN" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")"
CHAT_ID="$(printf '%s' "$CHAT_ID" | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")"

if [ -z "$BOT_TOKEN" ]; then
  echo "ALERTMANAGER_TG_BOT_TOKEN is empty in $ENV_FILE" >&2
  exit 1
fi

if [ -z "$CHAT_ID" ]; then
  echo "ALERTMANAGER_TG_CHAT_ID is empty in $ENV_FILE" >&2
  exit 1
fi

case "$CHAT_ID" in
  -[0-9]*|[0-9]*) : ;;
  *)
    echo "ALERTMANAGER_TG_CHAT_ID must be numeric (example: 1334350215 or -1001234567890)" >&2
    exit 1
    ;;
esac

sed \
  -e "s|__ALERTMANAGER_TG_BOT_TOKEN__|$BOT_TOKEN|g" \
  -e "s|__ALERTMANAGER_TG_CHAT_ID__|$CHAT_ID|g" \
  "$TEMPLATE_FILE" > "$OUTPUT_FILE"

chmod 644 "$OUTPUT_FILE"
echo "Generated: $OUTPUT_FILE"
