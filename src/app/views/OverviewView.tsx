import React from 'react';

export default function OverviewView() {
  return (
    <>
      <h3 className="text-xl font-bold mb-4">🏎️ Welcome to F1 Dashboard</h3>
      <p className="text-gray-400 mb-6">
        You are now viewing the <strong>Overview</strong> section. Live race telemetry, session status and quick links appear here.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="backdrop-blur-xl rounded-lg p-4 border border-gray-800 bg-gray-800/50">
          <h4 className="font-semibold mb-2 text-red-400">🏁 Live Racing</h4>
          <p className="text-sm text-gray-400">Real-time race data and lap times</p>
        </div>
        <div className="backdrop-blur-xl rounded-lg p-4 border border-gray-800 bg-gray-800/50">
          <h4 className="font-semibold mb-2 text-blue-400">📈 Session</h4>
          <p className="text-sm text-gray-400">Current session overview and leaders</p>
        </div>
        <div className="backdrop-blur-xl rounded-lg p-4 border border-gray-800 bg-gray-800/50">
          <h4 className="font-semibold mb-2 text-green-400">📍 Circuits</h4>
          <p className="text-sm text-gray-400">Track information and statistics</p>
        </div>
      </div>
    </>
  );
}
