import { NextResponse } from 'next/server';

type CacheEntry = {
  ts: number;
  data: unknown;
};

const cache = new Map<string, CacheEntry>();
const TTL = 60 * 1000; // 60s cache for live/current data

async function fetchJson(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Ergast fetch failed: ${res.status}`);
  return res.json();
}

export async function GET() {
  try {
    const cacheKey = 'standings_current_prev';
    const now = Date.now();

    const cached = cache.get(cacheKey);
    if (cached && now - cached.ts < TTL) {
      return NextResponse.json(cached.data);
    }

    // Attempt to fetch current and previous season standings from Ergast.
    // If the external request fails (network blocked or remote down), fall back to a small sample dataset
    // so the UI can still render helpfully instead of showing a 500 error.
    let season: string | null = null;
    let driversCurrent: unknown[] = [];
    let driversPrevious: unknown[] = [];

    try {
      const currentUrl = 'https://ergast.com/api/f1/current/driverStandings.json';
      const currentData = await fetchJson(currentUrl);
      season = currentData.MRData?.StandingsTable?.season ?? null;
      driversCurrent = currentData.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [];

      if (season) {
        const prevSeason = String(Number(season) - 1);
        const prevUrl = `https://ergast.com/api/f1/${prevSeason}/driverStandings.json`;
        const prevData = await fetchJson(prevUrl);
        driversPrevious = prevData.MRData?.StandingsTable?.StandingsLists?.[0]?.DriverStandings ?? [];
      }
    } catch (e) {
      // Log to server console for debugging (Next will show this in its server logs)
  console.warn('Ergast fetch failed, returning fallback sample data:', e instanceof Error ? e.message : String(e));

      // a minimal sample payload shaped like Ergast driver standings entries
      season = new Date().getFullYear().toString();
      driversCurrent = [
        { position: '1', points: '525', Driver: { givenName: 'Max', familyName: 'Verstappen' }, Constructors: [{ name: 'Red Bull Racing' }] },
        { position: '2', points: '325', Driver: { givenName: 'Lewis', familyName: 'Hamilton' }, Constructors: [{ name: 'Mercedes' }] },
        { position: '3', points: '220', Driver: { givenName: 'Lando', familyName: 'Norris' }, Constructors: [{ name: 'McLaren' }] },
      ];
      driversPrevious = [
        { position: '1', points: '454', Driver: { givenName: 'Max', familyName: 'Verstappen' }, Constructors: [{ name: 'Red Bull Racing' }] },
        { position: '2', points: '308', Driver: { givenName: 'Charles', familyName: 'Leclerc' }, Constructors: [{ name: 'Ferrari' }] },
        { position: '3', points: '305', Driver: { givenName: 'Sergio', familyName: 'Pérez' }, Constructors: [{ name: 'Red Bull Racing' }] },
      ];
    }

  const first = driversCurrent[0] as unknown;
  const source = driversCurrent.length > 0 && (typeof first === 'object' && first !== null && 'Driver' in (first as Record<string, unknown>)) ? 'ergast' : 'sample';
  const result = { source, season, driversCurrent, driversPrevious };

    cache.set(cacheKey, { ts: now, data: result });

    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
