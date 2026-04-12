# SmartCart

SmartCart is a **grocery savings** product: an **Expo (React Native)** mobile app talks to a **Node.js / Express** API backed by **PostgreSQL**, **Redis**, and **S3-compatible storage** (e.g. AWS S3 or Cloudflare R2). The backend ingests **receipt images**, runs **OCR**, builds **buying profiles**, **ranks local deals** (including Flipp-sourced offers when configured), and exposes **habits** and **notifications**.

---

## What runs where

| Layer | Role |
|--------|------|
| **Expo app** (`/`) | Auth (login/register), home map + deal list, deal detail & affiliate tap, receipt capture/upload, habits dashboard, notifications inbox, settings. Uses **SecureStore** for tokens and `EXPO_PUBLIC_API_URL` for the API base. |
| **API** (`/server`) | REST JSON API under `/api/*`: auth (JWT access + refresh), users, deals (ranked by location + profiles), receipts (presigned upload + processing queue), habits aggregates, notifications. |
| **PostgreSQL** | Users, deals, receipts, receipt line items, buy profiles, deal clicks, notifications — via **Prisma**. |
| **Redis** | **BullMQ** job queues (e.g. receipt processing, Flipp/cron-related work). |
| **Object storage** | Receipt images uploaded with **presigned PUT** URLs; processing reads from the stored URL. |
| **Google Cloud Vision** (optional path) | OCR / vision used in the receipt pipeline when configured (`GOOGLE_APPLICATION_CREDENTIALS`). |

---

## Repository layout

```
SmartCart/
├── app/                    # Expo Router screens (auth, tabs, deal, scan, settings)
├── components/             # UI (maps, theme, MVP layouts)
├── constants/              # Design tokens, API URL helper (EXPO_PUBLIC_API_URL)
├── context/                # AuthProvider + protected routing
├── lib/                    # api client, storage, receipt upload pipeline, types
├── server/
│   ├── prisma/             # schema + migrations
│   ├── src/
│   │   ├── routes/         # Express routers
│   │   ├── services/       # deals, S3, OCR helpers, ranking, etc.
│   │   └── workers/        # receipt worker, Flipp cron, notifications
│   ├── docker-compose.yml  # optional local Postgres (see below)
│   └── .env.example        # copy to .env — never commit real secrets
├── package.json            # Expo app scripts
└── server/package.json     # API scripts
```

---

## Prerequisites

- **Node.js** (LTS recommended)
- **PostgreSQL** (local or Docker)
- **Redis** (local) for queues
- **Expo CLI** / **Expo Go** or a dev build for the app
- Optional: **Docker** for the bundled Postgres in `server/docker-compose.yml`
- Optional: **AWS/R2** credentials and bucket for receipts; **Google** service account for Vision if you use that OCR path

---

## Backend setup

```bash
cd server
cp .env.example .env
# Edit .env: DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, Redis, S3, etc.
npm install
npx prisma generate
npx prisma migrate dev
npm run dev
```

The API listens on **`PORT`** (default **3000**). Health check: `GET /health`.

### Database notes (macOS / Homebrew)

Homebrew Postgres often uses your **macOS username** as the superuser, not `postgres`. Put the correct user (and password if any) in **`DATABASE_URL`**. If you use the provided Docker Compose file, start Docker Desktop, then:

```bash
npm run db:up
```

Use port **5433** in `DATABASE_URL` as mapped in `docker-compose.yml`, or adjust the compose file.

### Redis

Ensure Redis is reachable at **`REDIS_HOST`** / **`REDIS_PORT`** (defaults often `127.0.0.1:6379`). The server connects on startup.

---

## Mobile app setup

```bash
# from repo root
cp server/.env.example server/.env   # if you have not already — server only
npm install
```

Create a **`.env`** in the project root (optional) for the Expo app:

```bash
EXPO_PUBLIC_API_URL=http://127.0.0.1:3000
```

- **iOS Simulator** on the same Mac: `http://127.0.0.1:3000` is fine.
- **Android emulator**: often `http://10.0.2.2:3000`.
- **Physical device**: use your computer’s **LAN IP**, e.g. `http://192.168.x.x:3000`, and ensure the firewall allows the API port.

Start the bundler:

```bash
npm start
```

Run the **API** and **Expo** at the same time in separate terminals for full flows (auth, deals, uploads).

---

## Environment variables

**Server** — see **`server/.env.example`** for the full list. Important ones:

| Variable | Purpose |
|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` / `JWT_REFRESH_SECRET` | Sign access and refresh tokens |
| `REDIS_HOST` / `REDIS_PORT` | BullMQ |
| `AWS_*` / `S3_*` | Presigned uploads and bucket URLs |
| `GOOGLE_APPLICATION_CREDENTIALS` | Path to JSON key for Vision (if used) |
| `FLIPP_API_KEY` | Optional; deal ingestion cron may be gated on this |
| `CORS_ORIGIN` | Allowed origins (e.g. `*` for dev) |

**App** — `EXPO_PUBLIC_API_URL` only (read at build/bundle time by Expo).

Never commit **`server/.env`** or real keys; they are listed in **`.gitignore`**.

---

## Main API surface (conceptual)

- **`POST /api/auth/register`**, **`POST /api/auth/login`** — returns access + refresh tokens (JSON); refresh also via **`POST /api/auth/refresh`**.
- **`GET /api/users/me`** — current user (Bearer token).
- **`GET /api/deals`** — query `lat`, `lng`, `radius` (km); ranked deals.
- **`GET /api/deals/:id`**, **`POST /api/deals/click`** — detail + affiliate redirect bookkeeping.
- **`GET /api/receipts/upload-url`** → PUT image → **`POST /api/receipts`** — submit processing; **`GET /api/receipts/:id`** — status.
- **`GET /api/habits`** — spending / category / deal-savings style aggregates.
- **`GET /api/notifications`**, **`PATCH /api/notifications/:id/read`**.

Exact shapes follow `{ success: true, data: ... }` envelopes where implemented.

---

## Scripts (quick reference)

| Location | Command | Purpose |
|----------|---------|---------|
| Root | `npm start` | Expo dev server |
| `server` | `npm run dev` | API with nodemon + ts-node |
| `server` | `npm run db:up` / `db:down` | Docker Compose Postgres (optional) |
| `server` | `npx prisma migrate dev` | Apply migrations |

---

## License / contributing

Add a license and contribution guidelines when you open-source or share the repo. For team workflows, use feature branches (e.g. `Isha-smartcart`) and pull requests into `main`.
