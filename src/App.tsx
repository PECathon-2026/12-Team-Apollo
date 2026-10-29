import React from 'react';
import { AppShell } from './components/AppShell';

/**
 * Tsukuyomi Watch - Root Application Component
 * 
 * Thin root delegator ensuring modular file ownership.
 * Navigation and feature orchestrations reside in AppShell
 * and dedicated feature directories.
 */
export const App: React.FC = () => {
  return <AppShell />;
};

export default App;
