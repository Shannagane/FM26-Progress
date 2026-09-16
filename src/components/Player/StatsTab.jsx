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

// Les stats (buts, xG, passes…) sont stockées en texte brut par le parseur CSV et utilisent
// parfois la virgule française comme séparateur décimal (ex : "13,33").
function parseNum(raw) {
  if (raw === undefined || raw === null || raw === '') return null;
  const num = Number(String(raw).trim().replace(',', '.'));
  return Number.isNaN(num) ? null : num;
}

function formatSigned(num, decimals = 2) {
  const fixed = num.toFixed(decimals);
  return num > 0 ? `+${fixed}` : fixed;
}

// Écart entre le réalisé et l'attendu (buts vs xG, passes décisives vs passes décisives
// attendues) : vert si le joueur surperforme son attendu, rouge s'il sous-performe.
function EfficiencyBadge({ diff, percent }) {
  if (diff === null) return null;
  const tone = diff > 0 ? 'positive' : diff < 0 ? 'negative' : 'neutral';
  const percentText = percent !== null ? ` / ${formatSigned(percent, 0)}%` : '';
  return (
    <span className={`stat-efficiency stat-efficiency-${tone}`}>
      {formatSigned(diff)}{percentText}
    </span>
  );
}

function XgIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4.5" />
      <path d="M12 3v3M12 18v3M3 12h3M18 12h3" />
    </svg>
  );
}

function BallIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7.2l3.5 2.5-1.3 4.2h-4.4L8.5 9.7Z" strokeLinejoin="round" />
      <path d="M12 7.2V3.5M15.5 9.7l3.3-1.1M13.6 13.9l2.1 3.3M10.4 13.9l-2.1 3.3M8.5 9.7l-3.3-1.1" />
    </svg>
  );
}

function AssistIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 17c4-8 10-10 15-10" />
      <path d="M14 4l5 3-5 3" />
    </svg>
  );
}

function ExpectedAssistIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 17c4-8 10-10 15-10" strokeDasharray="2.5 2.8" />
      <path d="M14 4l5 3-5 3" />
    </svg>
  );
}

function MatchesIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="2.5" y="5" width="19" height="14" rx="1.5" />
      <circle cx="12" cy="12" r="3" />
      <path d="M2.5 12h2M19.5 12h2" />
    </svg>
  );
}

function PlayTimeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <circle cx="12" cy="13" r="8.5" />
      <path d="M12 9v4l3 2M9.5 2h5" />
    </svg>
  );
}

function ManOfMatchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
      <path d="M7 5H4a2 2 0 0 0 0 4h1M17 5h3a2 2 0 0 1 0 4h-1M9 18h6M12 14v4" />
    </svg>
  );
}

function RatingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3.5l2.6 5.3 5.9.9-4.25 4.1 1 5.85L12 16.9l-5.25 2.75 1-5.85L3.5 9.7l5.9-.9Z" />
    </svg>
  );
}

function ConcededIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 4h18v6c0 4-4 7-9 9-5-2-9-5-9-9Z" />
      <path d="M3 8h18M8 4v6.5M16 4v6.5" />
    </svg>
  );
}

function CleanSheetIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3l7 3v5c0 5-3 8-7 10-4-2-7-5-7-10V6Z" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" />
    </svg>
  );
}

function StatItem({ icon, label, value, extra }) {
  return (
    <div className="stat-item">
      <span className="stat-icon">{icon}</span>
      <span className="stat-item-text">
        <span className="stat-item-label">{label}</span>
        <span className="stat-item-value">{(value !== undefined && value !== null && value !== '') ? value : '–'} {extra}</span>
      </span>
    </div>
  );
}

function StatsRows({ data, isGK }) {
  const buts = parseNum(data.buts);
  const xg = parseNum(data.xg);
  const goalsDiff = (buts !== null && xg !== null && xg !== 0) ? buts - xg : null;
  const goalsPercent = goalsDiff !== null ? (goalsDiff / xg) * 100 : null;

  const passes = parseNum(data.passes_decisives);
  const pda = parseNum(data.passes_attendues);
  const assistsDiff = (passes !== null && pda !== null) ? passes - pda : null;

  return (
    <div className="stats-rows">
      <div className="stats-row">
        <StatItem icon={<XgIcon />} label="xG" value={data.xg} />
        <StatItem icon={<BallIcon />} label="Buts" value={data.buts} extra={<EfficiencyBadge diff={goalsDiff} percent={goalsPercent} />} />
        <StatItem icon={<ExpectedAssistIcon />} label="Passe décisives Attendus" value={data.passes_attendues} />
        <StatItem icon={<AssistIcon />} label="Passe décisives" value={data.passes_decisives} extra={<EfficiencyBadge diff={assistsDiff} percent={null} />} />
      </div>

      <div className="stats-row">
        <StatItem icon={<MatchesIcon />} label="Matchs Disputés" value={data.matchs_joues} />
        <StatItem icon={<PlayTimeIcon />} label="Temps de jeu" value={data.temps_de_jeu} />
        <StatItem icon={<ManOfMatchIcon />} label="Homme du match" value={data.homme_du_match} />
        <StatItem icon={<RatingIcon />} label="Note moyenne en club" value={data.note_moyenne} />
      </div>

      {isGK && (
        <div className="stats-row stats-row-gk">
          <StatItem icon={<ConcededIcon />} label="Buts encaissés" value={data.buts_encaisses} />
          <StatItem icon={<CleanSheetIcon />} label="Cage inviolée" value={data.cages_inviolees} />
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
