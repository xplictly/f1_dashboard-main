import React from 'react';

export default function DriversView() {
  const drivers = [
    { id: 'verstappen', name: 'Max Verstappen', team: 'Red Bull Racing', wins: 21 },
    { id: 'hamilton', name: 'Lewis Hamilton', team: 'Mercedes', wins: 4 },
    { id: 'norris', name: 'Lando Norris', team: 'McLaren', wins: 2 },
  ];

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">👨‍✈️ Drivers</h3>
      <p className="text-gray-400 mb-6">Driver profiles and quick statistics.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {drivers.map(d => (
          <div key={d.id} className="p-4 bg-gray-800/40 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold">{d.name}</div>
                <div className="text-xs text-gray-400">{d.team}</div>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium">{d.wins} wins</div>
                <div className="text-xs text-gray-400">Season</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
