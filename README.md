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

This is a Next.js 16 app (App Router) for a Telegram Mini App experience with Twitch/Steam linking.

### Stack and Tooling
- Next.js 16 + React 19
- Tailwind CSS v4 (CSS variables theme)
- Radix UI primitives + custom UI components
- Local i18n context (ru/en)
- Telegram WebApp SDK integration

### Routing (App Router)
- `app/layout.tsx`: Global layout, metadata, Telegram SDK script, i18n provider
- `app/page.tsx`: Main landing dashboard (viewer flow)
- `app/live/page.tsx`: Live streamers list
- `app/tracked/page.tsx`: Tracked streamers management
- `app/settings/page.tsx`: Language settings
- `app/streamer/page.tsx`: Streamer dashboard (linking, stats, config download)
- `app/streamer/events/page.tsx`: Streamer event settings
- `app/streamer/[id]/page.tsx`: Streamer profile entry
- `app/streamer/[id]/streamer-client.tsx`: Streamer profile client UI
- `app/streamer/[id]/prizes/page.tsx`: Streamer prizes entry
- `app/streamer/[id]/prizes/prizes-client.tsx`: Streamer prizes client UI
- `app/twitch/callback/page.tsx`: Twitch OAuth callback handler

### Components
- `components/ui/*`: Reusable UI primitives (Button, Card, Input, Badge, Switch)
- `components/*`: Feature blocks (account linking, live streamers, tracked streamers, stats, etc.)

### API and Auth
- `lib/api.ts`: API client with bearer token and cache-busting
- `lib/ensureAuth.ts`: Telegram `initData` auth flow for tokens
- `lib/i18n.tsx`: Language context and translations

### Styling
- `app/globals.css`: Active theme variables and base styles (dark palette)
- `styles/globals.css`: Secondary theme file (not imported in layout)

### Data and Auth Flow (Frontend)
- Telegram Mini App opens `app/page.tsx`
- `ensureAuth()` uses `Telegram.WebApp.initData` and posts to `/auth/telegram`
- Token is stored in `localStorage` and sent as `Authorization: Bearer <token>`
- On load, the app fetches `/me`, `/viewer/me`, and `/streamer/me` in parallel
- Twitch OAuth:
  - Viewer: `/twitch/authorize-viewer` -> external browser -> `/twitch/exchange-universal`
  - Streamer: `/twitch/authorize` -> external browser -> `/twitch/exchange-universal`

### API Endpoints Used by Frontend
Auth and health:
- `POST /auth/telegram`
- `POST /auth/dev` (debug)
- `GET /health`

Viewer:
- `GET /viewer/me`
- `POST /viewer/steam`
- `POST /viewer/steam/unlink`
- `POST /viewer/twitch/unlink`
- `GET /viewer/tracked`
- `POST /viewer/tracked`
- `DELETE /viewer/tracked/:id`

Streamer:
- `GET /streamer/me`
- `POST /streamer/me`
- `POST /streamer/delete`
- `POST /streamer/lis-skins-token`
- `POST /streamer/events`

Discovery and stats:
- `GET /streamers`
- `GET /streamers/live`
- `GET /streamers/:id`
- `GET /streamers/:id/prizes`

Twitch:
- `GET /twitch/authorize`
- `GET /twitch/authorize-viewer`
- `POST /twitch/exchange-universal`

### Dev and Debug Notes
- `?debug=1` on main pages reveals additional debug UI and dev login
- `next.config.mjs` sets `images.unoptimized = true` and `typescript.ignoreBuildErrors = true`
