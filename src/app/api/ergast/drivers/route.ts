import { NextResponse } from 'next/server';

const cache = new Map<string, { ts: number; data: unknown }>();
const TTL = 5 * 60 * 1000; // 5 minutes for drivers list

async function fetchJson(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Ergast fetch failed: ${res.status}`);
  return res.json();
}

export async function GET() {
  try {
    const cacheKey = 'drivers_current';
    const now = Date.now();
    const cached = cache.get(cacheKey);
    if (cached && now - cached.ts < TTL) return NextResponse.json(cached.data);

    try {
      const url = 'https://ergast.com/api/f1/current/drivers.json';
      const data = await fetchJson(url);
      const drivers = data.MRData.DriverTable?.Drivers || [];

      const result = { source: 'ergast', season: data.MRData?.season, drivers };
      cache.set(cacheKey, { ts: now, data: result });
      return NextResponse.json(result);
    } catch (e) {
      console.warn('Ergast drivers fetch failed, returning fallback:', e instanceof Error ? e.message : String(e));
      const sample = {
        source: 'sample',
        season: new Date().getFullYear().toString(),
        drivers: [
          { driverId: 'verstappen', givenName: 'Max', familyName: 'Verstappen', nationality: 'Dutch' },
          { driverId: 'hamilton', givenName: 'Lewis', familyName: 'Hamilton', nationality: 'British' },
          { driverId: 'norris', givenName: 'Lando', familyName: 'Norris', nationality: 'British' },
        ],
      };
      cache.set(cacheKey, { ts: now, data: sample });
      return NextResponse.json(sample);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
