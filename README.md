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

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
