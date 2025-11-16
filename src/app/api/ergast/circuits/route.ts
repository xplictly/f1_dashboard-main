import { NextResponse } from 'next/server';

const cache = new Map<string, { ts: number; data: unknown }>();
const TTL = 24 * 60 * 60 * 1000; // 24h cache for circuits

async function fetchJson(url: string) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Ergast fetch failed: ${res.status}`);
  return res.json();
}

export async function GET() {
  try {
    const cacheKey = 'circuits_all';
    const now = Date.now();
    const cached = cache.get(cacheKey);
    if (cached && now - cached.ts < TTL) return NextResponse.json(cached.data);

    try {
      const url = 'https://ergast.com/api/f1/circuits.json?limit=1000';
      const data = await fetchJson(url);
      const circuits = data.MRData?.CircuitTable?.Circuits || [];

      const result = { source: 'ergast', circuits };
      cache.set(cacheKey, { ts: now, data: result });
      return NextResponse.json(result);
    } catch (e) {
      console.warn('Ergast circuits fetch failed, returning fallback sample:', e instanceof Error ? e.message : String(e));
      const sample = {
        source: 'sample',
        circuits: [
          { circuitId: 'monza', circuitName: 'Autodromo Nazionale di Monza', Location: { country: 'Italy', locality: 'Monza' } },
          { circuitId: 'spa', circuitName: 'Circuit de Spa-Francorchamps', Location: { country: 'Belgium', locality: 'Stavelot' } },
          { circuitId: 'suzuka', circuitName: 'Suzuka Circuit', Location: { country: 'Japan', locality: 'Suzuka' } },
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
