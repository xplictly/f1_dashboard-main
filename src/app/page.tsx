"use client";

import { useState } from 'react';
import type { ComponentType, SVGProps } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, Gauge, MapPin, Activity, Menu, X } from 'lucide-react';
import OverviewView from './views/OverviewView';
import StandingsView from './views/StandingsView';
import DriversView from './views/DriversView';
import TracksView from './views/TracksView';
import TelemetryView from './views/TelemetryView';

type ViewType = 'overview' | 'standings' | 'drivers' | 'tracks' | 'telemetry';

type IconType = ComponentType<SVGProps<SVGSVGElement>>;

type NavItem = {
  id: ViewType;
  label: string;
  icon: IconType;
  description: string;
};

const navigationItems: NavItem[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: Activity,
    description: 'Live race data and current session'
  },
  {
    id: 'standings',
    label: 'Standings',
    icon: Trophy,
    description: 'Championship tables and rankings'
  },
  {
    id: 'drivers',
    label: 'Drivers',
    icon: Users,
    description: 'Driver profiles and statistics'
  },
  {
    id: 'tracks',
    label: 'Tracks',
    icon: MapPin,
    description: 'Circuit information and maps'
  },
  {
    id: 'telemetry',
    label: 'Telemetry',
    icon: Gauge,
    description: 'Live telemetry data'
  }
];

export default function Home() {
  const [currentView, setCurrentView] = useState<ViewType>('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const currentNavItem = navigationItems.find(item => item.id === currentView);
  const CurrentIcon = currentNavItem?.icon || Activity;

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950 via-gray-950 to-gray-900" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,theme(colors.red.500/0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,theme(colors.blue.500/0.1),transparent_50%)]" />
      </div>

      {/* Header */}
      <header className="backdrop-blur-xl border-b border-gray-800 sticky top-0 z-50 bg-gray-950/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo and Title */}
            <div className="flex items-center gap-4">
              <motion.div
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-600 to-blue-600 flex items-center justify-center"
              >
                <Gauge className="h-6 w-6 text-white" />
              </motion.div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  F1 Dashboard
                </h1>
                <p className="text-xs text-gray-400">
                  Live Race Data & Standings
                </p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = currentView === item.id;

                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={`
                      px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300
                      ${isActive
                        ? 'bg-red-600 text-white shadow-lg shadow-red-600/25'
                        : 'hover:bg-gray-800 text-gray-400 hover:text-white'
                      }
                    `}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{item.label}</span>
                  </button>
                );
              })}
            </nav>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-gray-800 transition-colors"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Current View Header */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <motion.div
              key={currentView}
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, ease: 'backOut' }}
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center"
            >
              <CurrentIcon className="h-4 w-4 text-white" />
            </motion.div>
            <div>
              <h2 className="text-xl font-bold text-white">
                {currentNavItem?.label}
              </h2>
              <p className="text-sm text-gray-400">
                {currentNavItem?.description}
              </p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full border bg-red-500/10 border-red-500/30 text-red-500 text-xs px-2 py-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="font-medium">LIVE</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 pb-8">
        <motion.div
          key={currentView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeInOut' }}
          className="backdrop-blur-xl rounded-lg p-6 border border-gray-800 bg-gray-900/80"
        >
          {/* Render view-specific content */}
          {currentView === 'overview' && (
            <OverviewView />
          )}

          {currentView === 'standings' && (
            <StandingsView />
          )}

          {currentView === 'drivers' && (
            <DriversView />
          )}

          {currentView === 'tracks' && (
            <TracksView />
          )}

          {currentView === 'telemetry' && (
            <TelemetryView />
          )}
        </motion.div>
      </main>
    </div>
  );
}


