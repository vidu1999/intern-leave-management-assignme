# Deploying LeaveManager to a public URL — A to Z

This guide takes you from a local project on your laptop to a **public HTTPS URL** anyone can
open (for your interview panel, for example).

The app is already prepared for this: **one Node process serves both the REST API and the built
React app**, so you need a single service, a single URL, and no CORS configuration.

```
https://your-app.onrender.com/          → React app
https://your-app.onrender.com/api/...   → REST API (same origin)
https://your-app.onrender.com/api/health → health probe
```

---

## Contents

1. [What you need before you start](#1-what-you-need-before-you-start)
2. [Understand the one-service design](#2-understand-the-one-service-design)
3. [Verify the production build locally first](#3-verify-the-production-build-locally-first)
4. [Option A — Render (recommended)](#4-option-a--render-recommended)
5. [Option B — Railway](#5-option-b--railway)
6. [Option C — Any server with Docker](#6-option-c--any-server-with-docker)
7. [Option D — Quick temporary demo link](#7-option-d--quick-temporary-demo-link)
8. [Loading demo data on the live site](#8-loading-demo-data-on-the-live-site)
9. [The SQLite persistence problem (read this)](#9-the-sqlite-persistence-problem-read-this)
10. [Environment variables reference](#10-environment-variables-reference)
11. [Post-deploy checklist](#11-post-deploy-checklist)
12. [Updating the live site](#12-updating-the-live-site)
13. [Custom domain](#13-custom-domain)
14. [Troubleshooting](#14-troubleshooting)

---

## 1. What you need before you start

| Requirement | Notes |
| --- | --- |
| GitHub account | Your repo: `https://github.com/vidu1999/ProjectSEI` |
| Code pushed to GitHub | Merge the feature branch into `main` first (see the note below) |
| Render / Railway account | Both sign in with GitHub — no credit card for the free tier |
| ~15 minutes | |

> **Merge first (recommended).** Render and Railway deploy a *branch*. You can point them at any
> branch, but for a clean submission merge your work into `main` first so the default branch on
> GitHub is the finished app.

---

## 2. Understand the one-service design

| Piece | Where it runs | Why |
| --- | --- | --- |
| React app | `client/dist` (static files) | Built by `npm run build`, then served by Express |
| REST API | `/api/*` on the same Express process | No separate API host, no CORS |
| SQLite database | `DATABASE_FILE` path on disk | One file, no database server |

`server/src/app.js` mounts the built SPA **only if `client/dist/index.html` exists**. If you deploy
without building, the API still runs and `/api/health` works — the UI just won't be there.

Two behaviours matter on a host:

* **SPA fallback** — `GET /employees` returns `index.html` so React Router handles the route.
  Refreshing a deep link on the public URL works.
* **`0.0.0.0` binding** — containers need it so the platform router can reach the process.
  Already the default (`HOST=0.0.0.0`).

---

## 3. Verify the production build locally first

Do this once. If it works on your laptop in production mode, the deploy almost always works.

```powershell
# From the repository root
npm run setup                     # installs both halves, .env files, migrations, demo data
npm ci --prefix server            # (or the explicit, lockfile-only installs below)
npm ci --prefix client

npm run build --prefix client      # creates client/dist
npm run db:migrate                 # creates server/data/leave_manager.db
npm run db:seed                    # OPTIONAL demo data

$env:NODE_ENV="production"
npm start                          # node server/src/server.js
```

Open <http://localhost:5000> — the full app should load on one port, and
<http://localhost:5000/api/health> should return:

```json
{ "success": true, "data": { "status": "ok", "uptime": 12, "environment": "production", "servesClient": true } }
```

`servesClient: true` is your proof the single-service mode is active.

---

## 4. Option A — Render (recommended)

Render gives you `https://<name>.onrender.com` with HTTPS and a persistent disk option. The repo
ships a `render.yaml` blueprint, so this is mostly clicking.

### 4.1 Create the service from the blueprint

1. Go to <https://dashboard.render.com> → sign in with GitHub.
2. Click **New +** → **Blueprint**.
3. Pick the repository `vidu1999/ProjectSEI` → **Connect**.
4. Render reads `render.yaml` and shows a service named **leavemanager**.
5. The blueprint deploys `main`. To preview an unmerged branch instead, edit the `branch:` line
   in `render.yaml` to that branch name — merging to `main` first is recommended.
6. Choose the **Starter** instance type (needed for the persistent disk). The free instance type
   works too — but see [section 9](#9-the-sqlite-persistence-problem-read-this).
7. Click **Apply**. The first build takes 3–6 minutes.

### 4.2 What Render runs (already in `render.yaml`)

| Setting | Value |
| --- | --- |
| Build command | `npm ci --prefix server && npm ci --prefix client && npm run build --prefix client` |
| Start command | `node server/src/server.js` |
| Health check path | `/api/health` |
| Disk | `leavemanager-data` mounted at `/var/data` (1 GB) |
| Env | `NODE_ENV=production`, `NODE_VERSION=22`, `HOST=0.0.0.0`, `DATABASE_FILE=/var/data/leave_manager.db` |

### 4.3 If you prefer manual setup (no blueprint)

**New +** → **Web Service** → pick the repo, then:

| Field | Value |
| --- | --- |
| Runtime | Node |
| Build command | `npm ci --prefix server && npm ci --prefix client && npm run build --prefix client` |
| Start command | `node server/src/server.js` |
| Instance type | Starter (for the disk) |

Then **Environment** → add:

```
NODE_ENV        = production
NODE_VERSION    = 22
HOST            = 0.0.0.0
DATABASE_FILE   = /var/data/leave_manager.db
```

**Disks** → **Add Disk**: name `leavemanager-data`, mount path `/var/data`, 1 GB.

### 4.4 First visit

Open the URL Render shows at the top of the service page. You should see the dashboard with
**0** in every card (empty database). That is correct — the schema was created automatically on
first boot. Continue to [section 8](#8-loading-demo-data-on-the-live-site) to load demo data.

---

## 5. Option B — Railway

Railway is the fastest path and has a generous trial; volumes keep SQLite alive.

1. Go to <https://railway.app> → **New Project** → **Deploy from GitHub repo** → pick `ProjectSEI`.
2. Open the service → **Settings**:
   * **Build Command**: `npm ci --prefix server && npm ci --prefix client && npm run build --prefix client`
   * **Start Command**: `node server/src/server.js`
3. **Variables** → add:
   ```
   NODE_ENV      = production
   HOST          = 0.0.0.0
   DATABASE_FILE = /data/leave_manager.db
   ```
   (Do **not** set `PORT` — Railway injects it.)
4. **Volumes** → **Add Volume** → mount path `/data`.
5. **Settings → Networking → Generate Domain**. Railway gives you
   `https://<name>.up.railway.app`.
6. Because Railway's default branch may differ, set **Settings → Source → Branch** to your branch
   or merge to `main` first.

> The repo also contains a `Procfile` (`web: node server/src/server.js`) which Railway and Heroku-style
> platforms pick up automatically.

---

## 6. Option C — Any server with Docker

The repo ships a multi-stage-ready `Dockerfile`. Use this on a VPS (DigitalOcean, Hetzner, AWS EC2,
Contabo), on Fly.io, or on Koyeb.

### 6.1 Build and run locally to test the image

```bash
docker build -t leavemanager .
docker run -d --name leavemanager \
  -p 5000:5000 \
  -v leavemanager-data:/app/data \
  leavemanager
# then open http://localhost:5000
```

The `-v` volume is what keeps the SQLite file across container restarts.

### 6.2 Run it on a VPS

```bash
# on the server
git clone https://github.com/vidu1999/ProjectSEI.git
cd ProjectSEI
docker build -t leavemanager .
docker run -d --restart unless-stopped --name leavemanager \
  -p 80:5000 \
  -v /srv/leavemanager:/app/data \
  leavemanager
```

Open `http://<server-ip>`. For HTTPS use Caddy (simplest) or nginx + certbot:

```caddy
# Caddyfile
leavemanager.example.com {
  reverse_proxy 127.0.0.1:5000
}
```

Caddy fetches a Let's Encrypt certificate for you — that is your global HTTPS URL.

### 6.3 Deploy to Fly.io

```bash
fly launch --no-deploy          # accept the Dockerfile it detects
fly volumes create leavemanager_data --size 1
# in fly.toml, set the mount and env:
#   [mounts]  source = "leavemanager_data"  destination = "/app/data"
#   [env]     NODE_ENV = "production"  HOST = "0.0.0.0"  DATABASE_FILE = "/app/data/leave_manager.db"
fly deploy
fly open
```

---

## 7. Option D — Quick temporary demo link

For a link that is live only while your laptop is running (fine for a same-day interview, **not**
for a submitted link that must stay up):

```powershell
# Terminal 1 - production build served locally
npm run build --prefix client
npm run db:seed
$env:NODE_ENV="production"; npm start

# Terminal 2 - expose port 5000 publicly
npx localtunnel --port 5000
# or: cloudflared tunnel --url http://localhost:5000
```

You get a URL like `https://clever-cat-42.loca.lt`. It dies when you close the terminal, and the
first visitor sees an interstitial page — mention that if you use it in an interview.

> Prefer Option A/B/C for anything you send in writing.

---

## 8. Loading demo data on the live site

The schema is created automatically, but the database starts **empty** (by design — no fake
records). To show the app with realistic data:

**Render:** open the service → **Shell** tab → run:

```bash
npm run db:seed --prefix server
```

**Railway:** service → **⋮** → **Shell**, then the same command.

**Docker / VPS:**

```bash
docker exec -it leavemanager npm run db:seed --prefix server
```

**Alternative with no shell access** — create data through the UI (Add Employee, then Submit Leave
Request). It takes two minutes and demonstrates the real workflow, which is arguably better in an
interview than pre-filled demo rows.

The seed is idempotent: it refuses to run when employees already exist. Force a clean reload with:

```bash
npm run db:seed --prefix server -- --force
```

---

## 9. The SQLite persistence problem (read this)

This is the one real trade-off of using SQLite on a cloud host, and you should be able to explain
it in the interview.

| Host setup | What happens to your data |
| --- | --- |
| Render **Starter** + disk mounted at `/var/data` | **Persists** across restarts and deploys |
| Render **Free** (no disk) | **Lost** on every redeploy, restart, or after the instance sleeps |
| Railway + volume mounted at `/data` | **Persists** |
| Docker + named volume | **Persists** |
| Docker without a volume | **Lost** when the container is removed |

Why: container filesystems are ephemeral. A disk/volume is a separate block store the platform
re-attaches to the new instance.

If you must stay on a free tier, either:

* accept that data resets (perfectly acceptable for a demo — just say so), or
* re-run `npm run db:seed --prefix server` after each deploy, or
* swap SQLite for a hosted Postgres — the only files that change are
  `server/db/*` and `server/src/data/*` because **all SQL lives there**; services and routes are
  untouched.

---

## 10. Environment variables reference

| Variable | Required | Example | Purpose |
| --- | --- | --- | --- |
| `PORT` | platform sets it | `5000` | HTTP port. Do not hardcode on Render/Railway |
| `HOST` | yes in containers | `0.0.0.0` | Bind address the platform router can reach |
| `NODE_ENV` | yes | `production` | Enables production logging, hides error details |
| `DATABASE_FILE` | yes | `/var/data/leave_manager.db` | Absolute path on the persistent volume |
| `CLIENT_ORIGIN` | only for split hosting | `https://app.example.com` | Extra origins allowed to call the API |
| `CLIENT_DIST` | no | `../client/dist` | Where the built SPA lives |
| `JSON_BODY_LIMIT` | no | `100kb` | Max request body size |

`CLIENT_ORIGIN` can be left empty when the SPA is served by the same process: same-origin requests
are always allowed, and foreign origins never receive CORS headers.

---

## 11. Post-deploy checklist

Run through this on the **public URL**, not localhost:

- [ ] `https://<your-url>/api/health` returns `"status":"ok"` and `"servesClient":true`
- [ ] Dashboard loads and shows numbers (or zeros with empty states)
- [ ] Deep link works after a hard refresh: open `https://<your-url>/employees` directly
- [ ] Add an employee → the row appears and the employee count increases
- [ ] Submit a leave request → status is **Pending** and it appears in `/leaves`
- [ ] Approve it → badge turns green, dashboard "Approved" counter increases
- [ ] Reject another one with a reason → red badge, reason visible in the table
- [ ] Try approving an already-processed request → the UI offers no button; calling the API directly
      returns **409** (proves backend enforcement)
- [ ] Reload the page → the data is still there (proves persistence)
- [ ] Open the URL on your phone → drawer navigation works
- [ ] Check the platform logs → no repeated 500s

---

## 12. Updating the live site

Both Render and Railway redeploy automatically when the connected branch changes.

```powershell
git add -A
git commit -m "feat: ..."
git push origin main
```

Render then runs the build command again and swaps the instance. Assets are fingerprinted, so
browsers pick up the new bundle immediately (`index.html` is served with `no-cache`).

If you deploy the branch directly and later merge to `main`, update the branch in the service
settings (**Settings → Build & Deploy → Branch**).

---

## 13. Custom domain

**Render:** Settings → **Custom Domains** → add `leave.yourdomain.com` → create the CNAME record it
shows at your DNS provider. TLS is issued automatically.

**Railway:** Settings → Networking → **Custom Domain** → same CNAME flow.

**VPS:** use Caddy (section 6.2) and point an A record at the server IP.

---

## 14. Troubleshooting

| Symptom | Cause | Fix |
| --- | --- | --- |
| Build fails: `better-sqlite3` node-gyp error | No prebuilt binary for the platform/Node version | Ensure `NODE_VERSION=22` (or 20); linux-x64/arm64 prebuilds exist |
| Deploy "succeeds" but URL shows `Cannot GET /` | Client was never built | Build command must include `npm run build --prefix client` |
| Page loads but UI is blank; console 404s on `/assets/...` | Stale `client/dist` from a previous build was deployed | Don't commit `client/dist`; let the platform build it. `.gitignore` already excludes it |
| API calls return 404 on a public URL | Frontend built with a wrong `VITE_API_BASE_URL` | Leave it empty so the SPA calls `/api` on its own origin |
| `EADDRINUSE` in logs | You hardcoded `PORT` while the platform injects one | Remove `PORT` from the dashboard env vars |
| Data disappears after redeploy | No persistent disk | Attach a disk/volume and set `DATABASE_FILE` inside it |
| `SQLITE_READONLY` / `SQLITE_CANTOPEN` | Disk not mounted at the configured path, or wrong permissions | Check the mount path matches `DATABASE_FILE`; the Docker image runs as `node` user, so chown the volume |
| Site sleeps and the first load takes ~30s | Free-tier cold start | Expected; upgrade or add a keep-alive ping |
| Amber **"The API is not reachable"** banner | API process crashed or is not listening | Open the platform logs; the API process usually died on a bad `DATABASE_FILE` path or a missing write permission on the data volume |

---

## One-page summary

```text
Local:   npm run build --prefix client  →  npm start  →  http://localhost:5000
Render:  Blueprint from render.yaml     →  https://<name>.onrender.com
Railway: GitHub repo + volume at /data  →  https://<name>.up.railway.app
Docker:  docker build + -v volume       →  http://<server-ip>  (+ Caddy for HTTPS)
Seed:    npm run db:seed --prefix server (dashboard Shell tab)
```
