import React, { useState } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Layout/Sidebar.jsx';
import Header from './components/Layout/Header.jsx';
import Dashboard from './components/Dashboard/Dashboard.jsx';
import ClubsPage from './components/Squad/ClubsPage.jsx';
import SquadPage from './components/Squad/SquadPage.jsx';
import GroupPage from './components/Squad/GroupPage.jsx';
import PlayerPage from './components/Player/PlayerPage.jsx';
import DepthPage from './components/Depth/DepthPage.jsx';
import NewgensPage from './components/Newgens/NewgensPage.jsx';
import NewgensResultsPage from './components/Newgens/NewgensResultsPage.jsx';
import NewgensPlayerPage from './components/Newgens/NewgensPlayerPage.jsx';
import TutoImportPage from './components/Tuto/TutoImportPage.jsx';
import './App.css';

const TITLES = {
  '/': 'Tableau de bord',
  '/effectif': 'Effectif',
  '/profondeur': "Profondeur d'effectif",
  '/newgens': 'Labo des Postes',
  '/tuto-import': 'Tuto import'
};

function resolveTitle(pathname) {
  if (TITLES[pathname]) return TITLES[pathname];
  if (/^\/newgens\/[^/]+$/.test(pathname)) return 'Résultats — Labo des Postes';
  if (/^\/effectif\/groupe\/[^/]+$/.test(pathname)) return 'Groupe';
  if (/^\/effectif\/[^/]+$/.test(pathname)) {
    const club = decodeURIComponent(pathname.split('/').pop());
    return club === '__all__' ? 'Effectif — Tous les clubs' : `Effectif — ${club}`;
  }
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
            <Route path="/effectif" element={<ClubsPage />} />
            <Route path="/effectif/groupe/:groupId" element={<GroupPage />} />
            <Route path="/effectif/:club" element={<SquadPage />} />
            <Route path="/profondeur" element={<DepthPage />} />
            <Route path="/newgens" element={<NewgensPage />} />
            <Route path="/newgens/:snapshotId" element={<NewgensResultsPage />} />
            <Route path="/newgens/:snapshotId/:playerId" element={<NewgensPlayerPage />} />
            <Route path="/joueur/:id" element={<PlayerPage />} />
            <Route path="/tuto-import" element={<TutoImportPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}
