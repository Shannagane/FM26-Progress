import React from 'react';
import { footColorClass } from '../../data/fieldsConfig.js';
import './PlayerInfo.css';

function InfoItem({ label, value, className = '' }) {
  return (
    <div className="info-item">
      <span className="info-label">{label}</span>
      <span className={`info-value ${className}`}>{value ?? '–'}</span>
    </div>
  );
}

export default function PlayerInfo({ player }) {
  return (
    <div className="player-info">
      <div className="info-row">
        <InfoItem label="Âge" value={player.age} />
        <InfoItem label="Taille" value={player.taille} />
        <InfoItem label="Pied gauche" value={player.pied_gauche} className={footColorClass(player.pied_gauche)} />
        <InfoItem label="Pied droit" value={player.pied_droit} className={footColorClass(player.pied_droit)} />
      </div>
    </div>
  );
}
