import React, { useState } from 'react';
import { isGoalkeeper } from '../../data/positionOrder.js';
import { groupSeasons } from '../../utils/seasons.js';
import './StatsTab.css';

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

function StatItem({ label, value }) {
  return (
    <div className="stat-item">
      <span className="stat-item-label">{label}</span>
      <span className="stat-item-value">{(value !== undefined && value !== null && value !== '') ? value : '–'}</span>
    </div>
  );
}

function StatsRows({ data, isGK }) {
  return (
    <div className="stats-rows">
      <div className="stats-row">
        <StatItem label="xG" value={data.xg} />
        <StatItem label="Buts" value={data.buts} />
        <StatItem label="Passe décisives Attendus" value={data.passes_attendues} />
        <StatItem label="Passe décisives" value={data.passes_decisives} />
      </div>

      <div className="stats-row">
        <StatItem label="Matchs Disputés" value={data.matchs_joues} />
        <StatItem label="Temps de jeu" value={data.temps_de_jeu} />
        <StatItem label="Homme du match" value={data.homme_du_match} />
        <StatItem label="Note moyenne en club" value={data.note_moyenne} />
      </div>

      {isGK && (
        <div className="stats-row stats-row-gk">
          <StatItem label="Buts encaissés" value={data.buts_encaisses} />
          <StatItem label="Cage inviolée" value={data.cages_inviolees} />
        </div>
      )}
    </div>
  );
}

export default function StatsTab({ player, snapshots }) {
  const isGK = isGoalkeeper(player.poste);
  const seasons = groupSeasons(snapshots, player.id);
  const [openSeasons, setOpenSeasons] = useState({});

  function toggle(label) {
    setOpenSeasons(prev => ({ ...prev, [label]: !prev[label] }));
  }

  if (seasons.length === 0) {
    return (
      <div className="stats-tab">
        <StatsRows data={player} isGK={isGK} />
      </div>
    );
  }

  const [current, ...previous] = seasons;

  return (
    <div className="stats-tab">
      <div className="stats-current">
        <div className="stats-current-header">
          <span className="stats-current-badge">Saison en cours</span>
          <span className="stats-current-meta">
            {current.label} · {current.importCount} import{current.importCount > 1 ? 's' : ''}
          </span>
        </div>
        <StatsRows data={current.latest} isGK={isGK} />
      </div>

      {previous.length > 0 && (
        <div className="stats-history">
          <h3 className="stats-history-title">Saisons précédentes</h3>
          {previous.map(season => {
            const isOpen = !!openSeasons[season.label];
            return (
              <div className={`stats-season-card ${isOpen ? 'stats-season-card-open' : ''}`} key={season.label}>
                <button
                  type="button"
                  className="stats-season-header"
                  onClick={() => toggle(season.label)}
                  aria-expanded={isOpen}
                >
                  <svg
                    className={`stats-season-chevron ${isOpen ? 'stats-season-chevron-open' : ''}`}
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
                  >
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                  <span className="stats-season-name">Saison {season.label}</span>
                  <span className="stats-season-range">
                    {formatDate(season.startDate)} → {formatDate(season.endDate)}
                  </span>
                </button>
                {isOpen && (
                  <div className="stats-season-body">
                    <StatsRows data={season.latest} isGK={isGK} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
