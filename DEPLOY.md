# Deploy SmartCart for free (MVP)

The **API** must run somewhere with **PostgreSQL**, **Redis**, and your **S3/R2** vars. The **Expo app** only needs `EXPO_PUBLIC_API_URL` pointing at that API.

Below is a **$0-friendly** stack that works with this repo’s **`server/Dockerfile`**.

---

## 1) PostgreSQL — Neon (free)

1. Create a project at [neon.tech](https://neon.tech).
2. Create a database; copy the **connection string** (starts with `postgresql://`).
3. You will use it as **`DATABASE_URL`** on the host (add `?sslmode=require` if their UI suggests it).

Run migrations once from your laptop (or in CI):

```bash
cd server
export DATABASE_URL="postgresql://...neon..."
npx prisma migrate deploy
```

---

## 2) Redis — Upstash (free)

1. Create a database at [upstash.com](https://upstash.com) (Redis).
2. Copy the **Redis URL** (`rediss://...`). Put it in the API env as **`REDIS_URL`**.
3. Leave **`REDIS_HOST` / `REDIS_PORT`** unset when `REDIS_URL` is set.

The server reads **`REDIS_URL`** first (see `server/src/lib/redis.ts`).

---

## 3) Object storage — Cloudflare R2 (free tier)

You already use S3-compatible config. Keep **`AWS_*`**, **`S3_ENDPOINT`**, **`AWS_S3_BUCKET`**, and optional **`S3_PUBLIC_URL`** as in `server/.env.example`.

---

## 4) API container — Render (free web service)

Render’s **free** web services **sleep** when idle (slow first request). Fine for demos.

**Avoid wrong stack:** Do **not** pick Elixir/Phoenix or any build command like `mix phx.digest`. This repo has **no `mix.exs`**. The API is **Node** under `server/`. Use **Docker** (below) or **Blueprint** from root `render.yaml`.

1. Push this repo to GitHub.
2. [Render Dashboard](https://dashboard.render.com/) → **New +** → **Web Service**.
3. Connect the repo; set:
   - **Runtime:** Docker  
   - **Dockerfile path:** `server/Dockerfile`  
   - **Docker context:** `server` (same folder as the Dockerfile)
4. **Instance type:** Free.
5. **Environment** — add at least:

| Key | Value |
|-----|--------|
| `DATABASE_URL` | Neon connection string |
| `REDIS_URL` | Upstash `rediss://...` |
| `JWT_SECRET` | Long random string (32+ chars) |
| `JWT_REFRESH_SECRET` | Different long random string |
| `AWS_REGION` | e.g. `auto` for R2 |
| `AWS_ACCESS_KEY_ID` | R2 token id |
| `AWS_SECRET_ACCESS_KEY` | R2 secret |
| `AWS_S3_BUCKET` | Bucket name |
| `S3_ENDPOINT` | R2 endpoint URL |
| `PORT` | `3000` (Render injects `PORT`; keep app reading `process.env.PORT` — already does) |
| `NODE_ENV` | `production` |
| `CORS_ORIGIN` | `*` for mobile dev, or your Expo web origin if you use web |
| `OCR_ENGINE` | `tesseract` to avoid GCP bills, or `auto` with Vision if you pay |

Optional: `GOOGLE_APPLICATION_CREDENTIALS` is not a file path in Docker unless you mount a secret — use **`OCR_ENGINE=tesseract`** on free deploy unless you inject Vision JSON as a secret.

6. Deploy. Open **`https://<your-service>.onrender.com/health`** — you should see `{"success":true,...}`.

**Note:** First boot runs **`prisma migrate deploy`** in the container `CMD`. Your DB must be reachable from Render’s network (Neon allows this by default).

### Blueprint (`render.yaml`)

Alternative: **New +** → **Blueprint** → connect this repo. Render provisions **`smartcart-api`** from `render.yaml`. In the service **Environment** tab, set every secret marked in the Blueprint (Neon, Upstash, JWT, R2). Same runtime as manual Docker.

### Render without Docker (fallback)

If you prefer **Node** build instead of Docker:

- **Root Directory:** `server`
- **Build Command:** `npm ci && npx prisma generate && npm run build`
- **Start Command:** `npx prisma migrate deploy && node dist/index.js`
- **Environment:** same variables as the table above (still set `REDIS_URL`, `DATABASE_URL`, etc.).

---

## 5) Expo app → production API

In the **project root** (or EAS env), set:

```bash
EXPO_PUBLIC_API_URL=https://<your-service>.onrender.com
```

Rebuild / restart Expo. Physical devices must use **HTTPS** URL of the deployed API.

For **App Store / Play Store** builds, use [EAS Build](https://docs.expo.dev/build/introduction/) (free tier has limits; enough for testing).

---

## Alternative hosts (still “cheap / free tier”)

- **Fly.io** — `fly launch` from `server/` with the same Dockerfile; free allowance changes over time.
- **Railway** — often trial credits; similar env var setup.
- **Cloudflare Workers** — would require rewriting the Express app into Workers; not drop-in.

---

## Checklist before you complain “it doesn’t work”

- [ ] `GET https://your-api/health` returns JSON OK  
- [ ] Same URL + `/api/auth/register` from `curl` works  
- [ ] `EXPO_PUBLIC_API_URL` has **no trailing slash**  
- [ ] Redis and Postgres env vars set on the **host**, not only in local `.env`  
- [ ] R2 bucket CORS allows **PUT** from the app origin if presigned uploads fail  

---

## Security

Do **not** commit `server/.env`. Rotate any keys that ever leaked into git or chat. Use Render/Fly **secrets** for production values.
