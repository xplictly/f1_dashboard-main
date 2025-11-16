"use client";

import React, { useEffect, useState } from 'react';

type DriverStanding = {
  position: string;
  points: string;
  Driver: { givenName: string; familyName: string };
  Constructors: Array<{ name: string }>;
};

export default function StandingsView() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [season, setSeason] = useState<string | null>(null);
  const [currentDrivers, setCurrentDrivers] = useState<DriverStanding[]>([]);
  const [previousDrivers, setPreviousDrivers] = useState<DriverStanding[]>([]);
  const [source, setSource] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/ergast/standings');
        if (!res.ok) throw new Error(`API error ${res.status}`);
  const data = await res.json();
  setSource(data.source ?? null);
  setSeason(data.season ?? null);
  setCurrentDrivers(data.driversCurrent ?? []);
  setPreviousDrivers(data.driversPrevious ?? []);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        setError(message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  return (
    <div>
      <div className="flex items-center gap-3 mb-4">
        <h3 className="text-xl font-bold">🏆 Standings</h3>
        {source && (
          <span className={`text-xs px-2 py-1 rounded-full ${source === 'ergast' ? 'bg-emerald-600/20 text-emerald-400 border border-emerald-500/30' : 'bg-gray-700/40 text-gray-300 border border-gray-600'}`}>
            {source === 'ergast' ? 'LIVE (Ergast)' : 'SAMPLE'}
          </span>
        )}
      </div>
      <p className="text-gray-400 mb-6">Driver and constructor standings for current and previous seasons.</p>

      {loading && <div className="text-sm text-gray-400">Loading standings…</div>}
      {error && <div className="text-sm text-red-400">Error: {error}</div>}

      {!loading && !error && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <section className="space-y-4">
            <h4 className="font-semibold text-lg">Drivers — Current Season {season ? `(${season})` : ''}</h4>
            <div className="bg-gray-800/40 rounded-lg border border-gray-700 p-3">
              <table className="w-full text-left text-sm">
                <thead className="text-gray-300 text-xs uppercase">
                  <tr>
                    <th className="w-8">#</th>
                    <th>Driver</th>
                    <th className="text-right">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {currentDrivers.map((d) => (
                    <tr key={d.position} className="border-t border-gray-800">
                      <td className="py-2 text-gray-300">{d.position}</td>
                      <td className="py-2"><span className="font-medium">{d.Driver.givenName} {d.Driver.familyName}</span> <span className="text-xs text-gray-400">— {d.Constructors[0]?.name}</span></td>
                      <td className="py-2 text-right text-white">{d.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h4 className="font-semibold text-lg">Constructors — Current Season</h4>
            <div className="bg-gray-800/40 rounded-lg border border-gray-700 p-3">
              <table className="w-full text-left text-sm">
                <thead className="text-gray-300 text-xs uppercase">
                  <tr>
                    <th className="w-8">#</th>
                    <th>Team</th>
                    <th className="text-right">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Derive constructors from driver standings: group by constructor */}
                  {Array.from(
                    currentDrivers.reduce((map, d) => {
                      const team = d.Constructors[0]?.name || 'Unknown';
                      if (!map.has(team)) map.set(team, 0);
                      map.set(team, map.get(team)! + Number(d.points));
                      return map;
                    }, new Map<string, number>())
                  ).map(([team, pts], idx) => (
                    <tr key={team} className="border-t border-gray-800">
                      <td className="py-2 text-gray-300">{idx + 1}</td>
                      <td className="py-2"><span className="font-medium">{team}</span></td>
                      <td className="py-2 text-right text-white">{pts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="space-y-4">
            <h4 className="font-semibold text-lg">Drivers — Previous Season</h4>
            <div className="bg-gray-800/30 rounded-lg border border-gray-700 p-3">
              <table className="w-full text-left text-sm">
                <thead className="text-gray-300 text-xs uppercase">
                  <tr>
                    <th className="w-8">#</th>
                    <th>Driver</th>
                    <th className="text-right">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {previousDrivers.map((d) => (
                    <tr key={`prev-d-${d.position}`} className="border-t border-gray-800">
                      <td className="py-2 text-gray-300">{d.position}</td>
                      <td className="py-2"><span className="font-medium">{d.Driver.givenName} {d.Driver.familyName}</span> <span className="text-xs text-gray-400">— {d.Constructors[0]?.name}</span></td>
                      <td className="py-2 text-right text-gray-200">{d.points}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h4 className="font-semibold text-lg">Constructors — Previous Season</h4>
            <div className="bg-gray-800/30 rounded-lg border border-gray-700 p-3">
              <table className="w-full text-left text-sm">
                <thead className="text-gray-300 text-xs uppercase">
                  <tr>
                    <th className="w-8">#</th>
                    <th>Team</th>
                    <th className="text-right">Pts</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from(
                    previousDrivers.reduce((map, d) => {
                      const team = d.Constructors[0]?.name || 'Unknown';
                      if (!map.has(team)) map.set(team, 0);
                      map.set(team, map.get(team)! + Number(d.points));
                      return map;
                    }, new Map<string, number>())
                  ).map(([team, pts], idx) => (
                    <tr key={`prev-c-${team}`} className="border-t border-gray-800">
                      <td className="py-2 text-gray-300">{idx + 1}</td>
                      <td className="py-2"><span className="font-medium">{team}</span></td>
                      <td className="py-2 text-right text-gray-200">{pts}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
