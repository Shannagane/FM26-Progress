import React from 'react';
import CsvImporter from './CsvImporter.jsx';
import ImportHistory from './ImportHistory.jsx';
import TopProgressions from './TopProgressions.jsx';
import './Dashboard.css';

export default function Dashboard() {
  return (
    <div className="dashboard-page">
      <div className="dashboard-explain">
        <div className="dashboard-explain-card dashboard-explain-card-effectif">
          <div className="dashboard-explain-header">
            <span className="dashboard-explain-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <circle cx="9" cy="8" r="3" />
                <path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
                <circle cx="17" cy="7" r="2.4" />
                <path d="M15.5 14.2c2.7.3 4.9 2.6 5.5 5.8" />
              </svg>
            </span>
            <h3>Importez votre effectif complet – FM26</h3>
          </div>
          <p>Exportez votre effectif depuis FM26 au format CSV et importez-le ici.</p>
          <p>L'outil va analyser l'ensemble de vos joueurs pour vous donner une vue complète de votre effectif.</p>
        </div>
      </div>

      <div className="dashboard-importer">
        <CsvImporter />
      </div>

      <TopProgressions />

      <ImportHistory />
    </div>
  );
}
