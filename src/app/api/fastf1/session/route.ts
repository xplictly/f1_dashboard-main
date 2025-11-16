import { NextResponse } from 'next/server';

const FASTF1_BASE = process.env.FASTF1_PROXY_URL || 'http://localhost:5000';

async function fetchJson(url: string) {
  const res = await fetch(url, { next: { revalidate: 10 } });
  if (!res.ok) throw new Error(`fastf1 proxy fetch failed: ${res.status}`);
  return res.json();
}

// simple in-memory cache to reduce repeated calls during development
const cache = new Map<string, { ts: number; data: unknown }>();
const CACHE_TTL = Number(process.env.FASTF1_CACHE_TTL ?? 30) * 1000; // ms

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const season = url.searchParams.get('season') ?? String(new Date().getFullYear());
    const round = url.searchParams.get('round') ?? '1';
    const detail = url.searchParams.get('detail') ?? '';

    const cacheKey = `${season}:${round}:${detail}`;
    const now = Date.now();
    const cached = cache.get(cacheKey);
    if (cached && now - cached.ts < CACHE_TTL) {
      return NextResponse.json(cached.data);
    }

    const target = `${FASTF1_BASE}/telemetry/session?season=${encodeURIComponent(season)}&round=${encodeURIComponent(round)}${detail ? `&detail=${encodeURIComponent(detail)}` : ''}`;

    try {
      const data = await fetchJson(target);

      // Normalize the different shapes returned by the Python proxy
      const maybe = data as Record<string, unknown>;
      if (Array.isArray(maybe.drivers)) {
        const drivers = (maybe.drivers as unknown[]).map((d) => {
          const entry = d as Record<string, unknown>;
          if (Array.isArray(entry.laps)) return entry;
          // older/compact format -> normalize
          const fastestLap = entry.fastestLap as Record<string, unknown> | undefined;
          return {
            driver: String(entry.driver ?? entry.driverNumber ?? ''),
            name: entry.name ?? null,
            laps: entry.laps ?? (fastestLap ? [ { lapNumber: fastestLap.lapNumber, lapTime: fastestLap.lapTime ?? fastestLap.lapTimeStr ?? null } ] : [])
          } as unknown;
        });

        const out = { source: (maybe.source as string) ?? 'fastf1', season, round, drivers };
        cache.set(cacheKey, { ts: now, data: out });
        return NextResponse.json(out);
      }

      const out = { source: (maybe.source as string) ?? 'fastf1', season, round, raw: data };
      cache.set(cacheKey, { ts: now, data: out });
      return NextResponse.json(out);
    } catch (e) {
      console.warn('FastF1 proxy unreachable, returning sample telemetry:', e instanceof Error ? e.message : String(e));
      const sample = {
        source: 'sample',
        season,
        round,
        drivers: [
          { driver: 'verstappen', name: 'Max Verstappen', laps: [ { lapNumber: 1, lapTime: '1:20.345' }, { lapNumber: 2, lapTime: '1:19.876' }, { lapNumber: 3, lapTime: '1:19.234' } ] },
          { driver: 'hamilton', name: 'Lewis Hamilton', laps: [ { lapNumber: 1, lapTime: '1:21.111' }, { lapNumber: 2, lapTime: '1:20.789' }, { lapNumber: 3, lapTime: '1:20.050' } ] },
          { driver: 'norris', name: 'Lando Norris', laps: [ { lapNumber: 1, lapTime: '1:21.500' }, { lapNumber: 2, lapTime: '1:20.999' }, { lapNumber: 3, lapTime: '1:20.200' } ] },
        ]
      };
      cache.set(cacheKey, { ts: now, data: sample });
      return NextResponse.json(sample);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
