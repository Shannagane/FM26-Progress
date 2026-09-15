import React from 'react';
import './PlayerTabs.css';

const TABS = [
  { key: 'attributs', label: 'Attributs' },
  { key: 'historique', label: 'Historique' },
  { key: 'personnalite', label: 'Personnalité' },
  { key: 'stats', label: 'Stats' }
];

export default function PlayerTabs({ active, onChange }) {
  return (
    <div className="player-tabs" role="tablist">
      {TABS.map(tab => (
        <button
          key={tab.key}
          role="tab"
          aria-selected={active === tab.key}
          className={`player-tab ${active === tab.key ? 'player-tab-active' : ''}`}
          onClick={() => onChange(tab.key)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
