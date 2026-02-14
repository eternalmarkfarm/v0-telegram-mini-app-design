# Monitoring Stack (Server-Side)

This folder contains a minimal monitoring stack for your server:
- Prometheus
- Alertmanager
- Grafana
- Node Exporter
- Postgres Exporter
- Blackbox Exporter

## Prerequisites
- Linux server
- Docker + Docker Compose plugin
- Backend API running on `127.0.0.1:8000` (for `/metrics` scrape)
- PostgreSQL accessible from the server

## 1) Configure env
```bash
cd monitoring
cp .env.example .env
```

Edit `.env`:
- set a strong `GRAFANA_ADMIN_PASSWORD`
- set `POSTGRES_EXPORTER_DSN` to your real DB credentials
- set Telegram alert params:
  - `ALERTMANAGER_TG_BOT_TOKEN`
  - `ALERTMANAGER_TG_CHAT_ID`

Generate Alertmanager config from `.env`:
```bash
sh scripts/render_alertmanager_config.sh
```

## 2) (Optional) Adjust probe URLs
Edit `prometheus/prometheus.yml` job `blackbox_http` and replace targets:
- `https://fastdrops.store/`
- `https://fastdrops.store/api/health`

with your production URLs.

## 3) Start stack
```bash
cd monitoring
docker compose --env-file .env up -d
```

Reload only Alertmanager after config changes:
```bash
sh scripts/render_alertmanager_config.sh
docker compose --env-file .env up -d alertmanager
docker compose logs alertmanager --tail=80
```

## 4) Verify
```bash
docker compose ps
curl -s http://127.0.0.1:9090/-/ready
curl -s http://127.0.0.1:9100/metrics | head
curl -s http://127.0.0.1:9187/metrics | head
curl -s http://127.0.0.1:9115/metrics | head
```

Grafana:
- URL: `http://SERVER_IP:${GRAFANA_PORT}`
- login: from `.env`

## Notes
- This compose uses `network_mode: host` (Linux) so Prometheus can scrape local host services directly.
- Grafana uses port `3300` by default to avoid conflict with Next.js on `3000`.
- Keep Prometheus/Alertmanager/exporter ports closed from public internet; expose only Grafana through HTTPS + auth.
- Alertmanager runtime config is read from `alertmanager/alertmanager.generated.yml` (generated from `.env`).
