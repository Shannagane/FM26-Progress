import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Layout/Sidebar.jsx';
import Header from './components/Layout/Header.jsx';
import Dashboard from './components/Dashboard/Dashboard.jsx';
import SquadPage from './components/Squad/SquadPage.jsx';
import PlayerPage from './components/Player/PlayerPage.jsx';
import HelpPage from './components/Help/HelpPage.jsx';
import NewgensPage from './components/Newgens/NewgensPage.jsx';
import NewgensResultsPage from './components/Newgens/NewgensResultsPage.jsx';
import NewgensPlayerPage from './components/Newgens/NewgensPlayerPage.jsx';
import './App.css';

const TITLES = {
  '/': 'Tableau de bord',
  '/effectif': 'Effectif',
  '/newgens': 'Labo des Postes',
  '/aide': 'Aide'
};

function resolveTitle(pathname) {
  if (TITLES[pathname]) return TITLES[pathname];
  if (/^\/newgens\/[^/]+$/.test(pathname)) return 'Résultats — Labo des Postes';
  return 'Fiche joueur';
}

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const title = resolveTitle(location.pathname);

  return (
    <div className="app-shell">
      <Sidebar open={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />
      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}
      <div className="app-content">
        <Header title={title} onMenuClick={() => setSidebarOpen(o => !o)} />
        <main className="app-main">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/effectif" element={<SquadPage />} />
            <Route path="/newgens" element={<NewgensPage />} />
            <Route path="/newgens/:snapshotId" element={<NewgensResultsPage />} />
            <Route path="/newgens/:snapshotId/:playerId" element={<NewgensPlayerPage />} />
            <Route path="/joueur/:id" element={<PlayerPage />} />
            <Route path="/aide" element={<HelpPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
