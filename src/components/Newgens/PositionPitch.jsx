import React from 'react';
import './PositionPitch.css';

const LEGEND = [
  { rank: 1, text: 'Poste idéal (meilleure note)' },
  { rank: 2, text: '2e meilleur poste' },
  { rank: 3, text: '3e meilleur poste' }
];

// Carte de terrain (vue verticale, but de l'équipe en bas) plaçant les postes analysés
// sous forme de ronds colorés selon leur rang (comme l'écran de tactique FM).
export default function PositionPitch({ dots }) {
  const hasInteriorVariant = dots.some(dot => dot.variant === 'interior');

  return (
    <div className="position-pitch">
      <svg viewBox="0 0 100 140" className="pitch-svg" preserveAspectRatio="xMidYMid meet">
        <rect x="1" y="1" width="98" height="138" rx="3" className="pitch-field" />

        <line x1="1" y1="70" x2="99" y2="70" className="pitch-line" />
        <circle cx="50" cy="70" r="11" className="pitch-line" fill="none" />
        <circle cx="50" cy="70" r="0.8" className="pitch-spot" />

        <rect x="22" y="1" width="56" height="21" className="pitch-line" fill="none" />
        <rect x="37" y="1" width="26" height="8" className="pitch-line" fill="none" />
        <circle cx="50" cy="24" r="0.8" className="pitch-spot" />

        <rect x="22" y="118" width="56" height="21" className="pitch-line" fill="none" />
        <rect x="37" y="131" width="26" height="8" className="pitch-line" fill="none" />
        <circle cx="50" cy="116" r="0.8" className="pitch-spot" />

        {dots.map(dot => (
          <g key={dot.key} transform={`translate(${dot.x} ${dot.y})`}>
            <circle
              r="7"
              className={`pitch-dot pitch-dot-rank-${dot.rank} ${dot.variant === 'interior' ? 'pitch-dot-interior' : ''}`}
            />
          </g>
        ))}
      </svg>

      <div className="pitch-legend">
        {LEGEND.map(item => (
          <div className="pitch-legend-item" key={item.rank}>
            <span className={`pitch-legend-dot pitch-legend-dot-rank-${item.rank}`} />
            <span>{item.text}</span>
          </div>
        ))}
        {hasInteriorVariant && (
          <div className="pitch-legend-item">
            <span className="pitch-legend-dot pitch-legend-dot-interior" />
            <span>Variante Ailier Intérieur</span>
          </div>
        )}
      </div>
    </div>
  );
}
