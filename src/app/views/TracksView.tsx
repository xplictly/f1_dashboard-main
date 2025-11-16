import React from 'react';

export default function TracksView() {
  const tracks = [
    { id: 'monza', name: 'Monza', country: 'Italy', length: '5.793 km' },
    { id: 'spa', name: 'Spa-Francorchamps', country: 'Belgium', length: '7.004 km' },
    { id: 'suzuka', name: 'Suzuka', country: 'Japan', length: '5.807 km' },
  ];

  return (
    <div>
      <h3 className="text-xl font-bold mb-4">📍 Tracks</h3>
      <p className="text-gray-400 mb-6">Circuit information and maps.</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {tracks.map(t => (
          <div key={t.id} className="p-4 bg-gray-800/40 rounded-lg border border-gray-700">
            <div className="font-semibold">{t.name}</div>
            <div className="text-xs text-gray-400">{t.country} • {t.length}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
