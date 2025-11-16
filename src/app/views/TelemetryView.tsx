"use client";

import React, { useEffect, useState } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

type LapPoint = { lapNumber: number; lapTime: string };
type DriverTelemetry = { driver: string; name?: string; laps: LapPoint[] };

function parseLapTimeToSeconds(t: string | null): number {
  if (!t) return Infinity;
  // support formats like '1:20.345' or '80.345'
  if (t.indexOf(':') >= 0) {
    const [m, s] = t.split(':');
    return Number(m) * 60 + Number(s);
  }
  return Number(t);
}

const COLORS = ['#f97316', '#06b6d4', '#60a5fa', '#34d399', '#f472b6'];

export default function TelemetryView() {
  const [season, setSeason] = useState(String(new Date().getFullYear()));
  const [round, setRound] = useState('1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [drivers, setDrivers] = useState<DriverTelemetry[]>([]);
  const [source, setSource] = useState<string | null>(null);
  const [detailFull, setDetailFull] = useState(false);

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const detailParam = detailFull ? '&detail=full' : '';
      const res = await fetch(`/api/fastf1/session?season=${season}&round=${round}${detailParam}`);
      if (!res.ok) throw new Error(`API error ${res.status}`);
      const data = await res.json();
      // normalize drivers
  setSource(String(data.source ?? null));
  const rawDrivers = (data.drivers ?? []) as unknown[];
      const d: DriverTelemetry[] = rawDrivers.map((dr) => {
        const item = dr as Record<string, unknown>;
        const lapsRaw = (item.laps as unknown[]) ?? [];
        const laps = lapsRaw.map((l) => {
          const lp = l as Record<string, unknown>;
          return { lapNumber: Number(lp.lapNumber ?? 0), lapTime: String(lp.lapTime ?? '') };
        });
        return {
          driver: String(item.driver ?? item.driverId ?? item.name ?? 'unknown'),
          name: String(item.name ?? `${item.driver ?? ''}`),
          laps
        };
      });
      setDrivers(d);
    } catch (err) {
      const m = err instanceof Error ? err.message : String(err);
      setError(m);
    } finally {
      setLoading(false);
    }
  }

  // prepare chart data
  const allLapNums = Array.from(new Set(drivers.flatMap(d => d.laps.map(l => l.lapNumber)))).sort((a,b)=>a-b);
  const labels = allLapNums.map(n => `Lap ${n}`);
  const pointsPerDriver = drivers.map(d => {
    const map = new Map(d.laps.map(l => [l.lapNumber, parseLapTimeToSeconds(l.lapTime)]));
    return labels.map((_, i) => {
      const lap = allLapNums[i];
      const val = map.get(lap);
      return Number.isFinite(val) ? Number(val) : null;
    });
  });

  // Chart.js data
  const chartData = {
    labels,
    datasets: drivers.map((d, idx) => ({
      label: d.name ?? d.driver,
      data: pointsPerDriver[idx],
      borderColor: COLORS[idx % COLORS.length],
      backgroundColor: COLORS[idx % COLORS.length],
      tension: 0.25,
      spanGaps: true,
    })),
  };

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: false },
      tooltip: { mode: 'index' as const, intersect: false },
    },
    scales: {
      x: { title: { display: true, text: 'Lap' } },
      y: { title: { display: true, text: 'Lap time (s)' }, reverse: false },
    },
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold">📡 Telemetry</h3>
          <p className="text-gray-400">Compare lap times between drivers for a session (sample/proxy data).</p>
        </div>
        <div className="flex items-center gap-2">
          <input className="bg-gray-800/40 text-sm rounded px-2 py-1" value={season} onChange={e => setSeason(e.target.value)} />
          <input className="bg-gray-800/40 text-sm rounded px-2 py-1" value={round} onChange={e => setRound(e.target.value)} />
          <button onClick={load} className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded">Load</button>
        </div>
      </div>

      {loading && <div className="text-sm text-gray-400">Loading telemetry…</div>}
      {error && <div className="text-sm text-red-400">Error: {error}</div>}

      {!loading && !error && (
        <div className="bg-gray-800/30 rounded-lg p-4 border border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <div />
            {source && (
              <span className={`text-xs px-2 py-1 rounded-full ${source === 'fastf1' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'bg-gray-700/40 text-gray-300 border border-gray-600'}`}>
                {source === 'fastf1' ? 'LIVE (FastF1)' : 'SAMPLE'}
              </span>
            )}
          </div>

          <div className="text-xs text-gray-400 mt-1">Run the optional FastF1 proxy locally for live telemetry: <span className="font-mono">services/fastf1/README.md</span>. Toggle full detail below to request per-driver lap lists from the proxy.</div>

          <div className="mt-2 flex items-center gap-3">
            <label className="text-sm flex items-center gap-2">
              <input type="checkbox" checked={detailFull} onChange={e => setDetailFull(e.target.checked)} />
              <span className="text-gray-400">Request detail=full</span>
            </label>
          </div>

          <div style={{ height: 340 }}>
            <Line data={chartData} options={chartOptions} />
          </div>

          <div className="mt-3 flex gap-3 flex-wrap">
            {drivers.map((d, idx) => (
              <div key={d.driver} className="flex items-center gap-2 bg-gray-900/40 px-3 py-2 rounded border border-gray-700">
                <span style={{ width: 12, height: 12, background: COLORS[idx % COLORS.length], display: 'inline-block', borderRadius: 4 }} />
                <div className="text-sm">
                  <div className="font-medium">{d.name ?? d.driver}</div>
                  <div className="text-xs text-gray-400">{d.laps.length} laps</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
