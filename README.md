# F1 Dashboard — Ergast + FastF1

A polished Formula 1 dashboard built with Next.js and TypeScript.

This repository demonstrates a pragmatic, production-minded approach to combining:

- Ergast Motor Racing Data API — historical and current standings, drivers and circuits.
- FastF1 (optional Python sidecar) — session telemetry for lap-level analysis (optional/service sidecar).

The Next app ships small adapter routes under `src/app/api/*` that normalize external APIs and provide sample fallbacks so the UI stays useful even when external services are unreachable.

---

> Live demo: run locally (see Quickstart) — the app will use Ergast for standings/drivers/circuits and an optional FastF1 sidecar for telemetry.

## Highlights

- Clean UI with tabs: Overview, Standings, Drivers, Tracks, Telemetry.
- Telemetry chart (Chart.js) comparing lap times between drivers. Requests a local FastF1 proxy for live telemetry, or falls back to sample data if the proxy is unavailable.
- Ergast-backed endpoints include a `source` field (`ergast` or `sample`) so the UI can show badges and clarify live vs fallback data.
- Lightweight in-memory cache on the Next FastF1 adapter for development (configurable TTL).

## Quickstart

1. Clone or copy the repository and install Node.js dependencies:

```bash
cd /path/to/f1_dashboard-main
npm install
```

2. Run the Next.js dev server:

```bash
npm run dev
# Open http://localhost:3000
```

3. (Optional) Run the FastF1 telemetry proxy for live lap telemetry

The telemetry proxy lives in `services/fastf1/` and uses the community `fastf1` package.

```bash
cd services/fastf1
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 5000
```

By default the Next app proxies to `http://localhost:5000`. The Telemetry tab includes a toggle to request `detail=full` from the proxy (per-driver lap lists).

## Configuration & environment

- `FASTF1_PROXY_URL` — set to your FastF1 proxy URL (defaults to `http://localhost:5000`).
- `FASTF1_CACHE_TTL` — TTL (in seconds) for the in-memory cache used by the Next FastF1 adapter (defaults to 30).

Use a local `.env.local` for overrides. The repository's `.gitignore` excludes `.env*` and common caches.

## Project structure (short)

- `src/app/` — Next.js app directory and views.
- `src/app/api/ergast/*` — Ergast adapter routes (standings, drivers, circuits).
- `src/app/api/fastf1/session` — Next-side proxy and cache for FastF1 telemetry.
- `services/fastf1/` — optional Python FastF1 proxy (FastAPI + fastf1).

## How it works

- Frontend → Next API (adapters) → Ergast / FastF1 proxy.
- Adapters normalize responses and attach a `source` flag. The UI displays a small badge to indicate live vs sample data.

## Deployment notes

- Deploy this as a normal Next.js app (Vercel, Netlify, or custom Node host).
- If using live telemetry in production, run the Python FastF1 proxy separately (containerized/VM) and protect it behind authentication.
- For production telemetry caching, use Redis or another persistent cache rather than an in-memory Map.

## Contribution & License

PRs welcome. If you add features, please include tests for API normalization.

License: MIT

---

Built with ❤️ for F1 fans. 🚥

=================================================================

DETAILED PROJECT REFERENCE
--------------------------

This section documents the project files, routes, services, and design decisions so you (or contributors) can understand and extend the codebase quickly.

Top-level layout
- `package.json` — Node project manifest with scripts (dev, build, start).
- `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `eslint.config.mjs` — standard Next/TS/Tailwind/lint configs.
- `src/app/` — Next.js app directory (app router). Main files:
	- `page.tsx` — entry page and navigation between tabs (Overview, Standings, Drivers, Tracks, Telemetry).
	- `layout.tsx` — global layout and CSS import.
	- `globals.css` — app styles.
	- `views/` — per-tab components:
		- `OverviewView.tsx` — dashboard landing.
		- `StandingsView.tsx` — pulls `/api/ergast/standings` and shows driver standings (with `source` badge).
		- `DriversView.tsx` — driver list UI.
		- `TracksView.tsx` — circuits listing powered by Ergast.
		- `TelemetryView.tsx` — client component that renders a Chart.js line chart comparing lap times.

Server adapters (Next API routes)
- `src/app/api/ergast/standings/route.ts` — server-side adapter for Ergast driver standings. Adds `{ source: 'ergast' | 'sample' }` and a small TTL cache.
- `src/app/api/ergast/drivers/route.ts` — fetches and normalizes Ergast drivers list.
- `src/app/api/ergast/circuits/route.ts` — fetches circuits from Ergast.
- `src/app/api/fastf1/session/route.ts` — Next-side proxy to the FastF1 Python service. Adds a small in-memory TTL cache and normalizes various payload shapes into `{ source, season, round, drivers }`.

FastF1 Python sidecar (optional)
- `services/fastf1/main.py` — FastAPI service that uses the `fastf1` library to download session lap data. Exposes `/telemetry/session?season=&round=&detail=full`.
	- `detail=full` returns per-driver lap lists (lapNumber, lapTimeSeconds, lapTimeStr).
	- Default response is a compact fastest-lap summary for each driver.
- `services/fastf1/requirements.txt` — Python dependencies for the proxy.
- `services/fastf1/README.md` — run instructions for the Python proxy (see Quickstart below).

TypeScript & typings
- `src/types/shims.d.ts` and `src/types/css.d.ts` provide minimal ambient modules so third-party client libs and CSS imports don't break builds during local dev.

Design notes and rationale
- Ergast for stable public data — it's free and reliable for standings, drivers, results, and circuits.
- FastF1 for session telemetry — a community-maintained library useful for lap-by-lap analysis. It's run as a separate Python process to avoid mixing runtimes.
- Adapters: Next server routes act as an adapter layer between the frontend and external APIs. This centralizes caching, normalization, and fallback logic.
- Resilience: All remote fetches include graceful fallbacks to small sample payloads so the UI remains interactive if Ergast or the FastF1 proxy are unreachable.

Running the project (detailed)
--------------------------------

1) Node / Next development

```bash
# from project root
npm install
npm run dev
# open http://localhost:3000 in your browser
```

2) Build for production (local test)

```bash
npm ci
npm run build
# serve with `npm start` or host with your provider
```

3) FastF1 proxy (optional but required for live telemetry)

Prereqs: Python 3.10+, pip, and network access to FastF1's data sources.

```bash
cd services/fastf1
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 5000
```

The Python proxy will create a small local cache (fastf1 cache directory) to speed repeated operations. Do NOT commit that cache to Git.

Environment variables
----------------------
- `FASTF1_PROXY_URL` — override the FastF1 proxy base URL used by `/api/fastf1/session` (defaults to `http://localhost:5000`).
- `FASTF1_CACHE_TTL` — seconds; TTL for the in-memory cache in the Next FastF1 adapter (defaults to 30).

Working with telemetry
-----------------------
- In the Telemetry tab you can enter `season` and `round`. By default the Next proxy requests a compact summary. Toggle `detail=full` to request full per-driver lap lists from the Python proxy.
- The Chart.js view will render lap times in seconds. The UI includes a `source` badge showing `LIVE (FastF1)` or `SAMPLE` depending on the backend response.

Testing & CI
-------------
- The project currently includes a placeholder GitHub Actions workflow template under `.github/workflows/` created during initial commit. Recommended CI steps:
	1. `npm ci`
	2. `npm run build`
	3. (optional) run unit tests if added.

Security & secrets
-------------------
- Keep secrets like API tokens out of git. Use `.env.local` (already in `.gitignore`) or GitHub Secrets for CI.
- If you deploy the Python proxy to a public environment, protect it (auth, IP allowlist) — FastF1 pulls data and storing/cache policies may require care.

Pushing to GitHub (quick commands)
----------------------------------
If you created this repo locally (we initialized git), push to a GitHub repo you create via the web UI or CLI. Example (SSH):

```bash
git remote add origin git@github.com:YOUR_GITHUB_USERNAME/f1-dashboard.git
git branch -M main
git push -u origin main
```

If you prefer the GitHub CLI after installing and authenticating (`gh auth login`):

```bash
gh repo create YOUR_GITHUB_USERNAME/f1-dashboard --public --source=. --push --confirm
```

Troubleshooting common issues
-------------------------------
- Next build errors referencing third-party client libs: ensure `npm install` completed and `src/types/shims.d.ts` exists to satisfy basic typings.
- If `ergast.com` or the FastF1 proxy are unreachable, the UI shows sample data automatically. Check network outbound access in that case.
- FastF1 proxy errors: ensure the `fastf1` Python package is installed and the cache directory is writable.

Roadmap ideas (optional follow-ups)
----------------------------------
- Add Redis-backed caching for production telemetry and Ergast rate-limiting protection.
- Add unit/integration tests for API normalization and caching semantics.
- Make Telemetry charts interactive (tooltips, point highlighting, range selector).
- Dockerize the Python proxy and add docker-compose orchestration for dev.

Contact / Credits
------------------
This project is a showcase combining public F1 data sources (Ergast) and community telemetry (FastF1). If you reuse or redistribute telemetry, please check licensing and attribution.

Enjoy the data — and let me know if you want this pushed to your GitHub account or if you want a CI workflow added.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

This project is an F1 Dashboard demo. Added integrations in this branch:

- Ergast Motor Racing Data API (free) — server API routes under `src/app/api/ergast/*` provide standings, drivers, and circuits.
- FastF1 proxy service (community telemetry) — a small Python FastAPI service lives in `services/fastf1/` to fetch session telemetry and expose a simple JSON endpoint.

How this is wired
- The Next app fetches standings from the Ergast endpoints at `/api/ergast/standings` and displays them in `src/app/views/StandingsView.tsx`.
- For telemetry (lap/telemetry details), run the FastF1 proxy and call it from client code (e.g. `http://localhost:5000/telemetry/session?season=2025&round=1`).

Quick run

1. Install Node deps and run the Next dev server:

```bash
npm install
npm run dev
```

2. (Optional) Run the FastF1 proxy for telemetry features:

```bash
cd services/fastf1
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 5000
```

Notes
- Ergast is free and covers drivers, standings, results and circuits but not live telemetry.
- FastF1 provides telemetry access for analysis but is community-based and not licensed for redistribution. Use for personal/prototyping only unless you obtain a commercial feed.
You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

