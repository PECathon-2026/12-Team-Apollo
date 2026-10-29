import React, { useState } from 'react';
import { AppShell } from './components/AppShell';
import { Dashboard } from './features/dashboard/Dashboard';
import { Watchtower } from './features/watchtower/Watchtower';
import { CelestialScroll } from './features/scroll/CelestialScroll';
import { SpiritLens } from './features/spirit-lens/SpiritLens';
import { DojoDashboard } from './features/dojo/DojoDashboard';
import { CursorTrail } from './components/CursorTrail';
import { NavSectionId } from './types';

export const App: React.FC = () => {
  // Opening the web: ONLY the dashboard is visible
  const [currentView, setCurrentView] = useState<NavSectionId>('dashboard');

  const renderActiveFeature = () => {
    switch (currentView) {
      case 'watchtower':
        return <Watchtower />;
      case 'scroll':
        return <CelestialScroll />;
      case 'spirit-lens':
        return <SpiritLens />;
      case 'dojo':
        return <DojoDashboard />;
      default:
        return <Watchtower />;
    }
  };

  // 1. Initial / Dashboard View: ONLY the dashboard is visible
  // The user chooses from the 4 options directly from here
  if (currentView === 'dashboard') {
    return (
      <div className="standalone-dashboard-wrapper">
        <CursorTrail />
        <Dashboard onSelectOption={(option) => setCurrentView(option)} />
      </div>
    );
  }

  // 2. Section View: Once a section is entered, the universal AppShell becomes active
  // From here the user can commute to ANY other section (or back to the Dashboard)
  return (
    <div className="app-shell-wrapper">
      <CursorTrail />
      <AppShell activeView={currentView} onViewChange={(view) => setCurrentView(view)}>
        {renderActiveFeature()}
      </AppShell>
    </div>
  );
};

export default App;
