import React from 'react';
import CsvImporter from './CsvImporter.jsx';
import ImportHistory from './ImportHistory.jsx';
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

        <div className="dashboard-explain-card dashboard-explain-card-newgens">
          <div className="dashboard-explain-header">
            <span className="dashboard-explain-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M12 3l1.9 4.6L18.5 9l-4.6 1.9L12 15.5l-1.9-4.6L5.5 9l4.6-1.9L12 3Z" />
                <path d="M19 15.5l.8 1.9 1.9.8-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-.8.8-1.9Z" />
              </svg>
            </span>
            <h3>Repérez vos Newgens</h3>
          </div>
          <p>Pas besoin d'un export séparé : le même effectif complet suffit.</p>
          <p>Dans le Labo des Postes, filtre cet import sur les Newgens (contrat débutant à ± 1 jour de l'export) pour cibler directement les nouvelles pépites et leur poste idéal.</p>
        </div>
      </div>

      <div className="dashboard-importer">
        <CsvImporter />
      </div>

      <ImportHistory />
    </div>
  );
}
