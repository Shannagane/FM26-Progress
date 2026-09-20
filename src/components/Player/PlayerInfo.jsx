import { footColorClass } from '../../data/fieldsConfig.js';
import { computeIdealPosition } from '../../data/newgensPositionProfiles.js';
import './PlayerInfo.css';

function AgeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M8 2v4M16 2v4M3 9h18M5 5h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2Z" />
    </svg>
  );
}

function HeightIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 3v18M8 7l4-4 4 4M8 17l4 4 4-4" />
    </svg>
  );
}

function FootIcon({ mirrored = false }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      style={mirrored ? { transform: 'scaleX(-1)' } : undefined}
    >
      <path d="M3 18v-3.5c0-1 .5-2 1.5-2.5L10 9V5a2 2 0 0 1 2-2c1 0 1.5.5 2 1.5l1.5 3c.5 1 1.5 1.5 2.5 1.5H20a2 2 0 0 1 2 2v3a3 3 0 0 1-3 3H5a2 2 0 0 1-2-2Z" />
    </svg>
  );
}

function PositionIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 21s7-5.5 7-11a7 7 0 1 0-14 0c0 5.5 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function InfoItem({ icon, label, value, className = '' }) {
  return (
    <div className="info-item">
      <span className="info-icon">{icon}</span>
      <span className="info-item-text">
        <span className="info-label">{label}</span>
        <span className={`info-value ${className}`}>{value ?? '–'}</span>
      </span>
    </div>
  );
}

function idealPositionLabel(player) {
  const ideal = computeIdealPosition(player);
  if (!ideal) return null;
  return ideal.profile.label;
}

export default function PlayerInfo({ player }) {
  const bestPoste = idealPositionLabel(player);

  return (
    <div className="player-info">
      <div className="info-row">
        <InfoItem icon={<AgeIcon />} label="Âge" value={player.age} />
        <InfoItem icon={<HeightIcon />} label="Taille" value={player.taille} />
        <InfoItem icon={<FootIcon />} label="Pied gauche" value={player.pied_gauche} className={footColorClass(player.pied_gauche)} />
        <InfoItem icon={<FootIcon mirrored />} label="Pied droit" value={player.pied_droit} className={footColorClass(player.pied_droit)} />
        <InfoItem icon={<PositionIcon />} label="Meilleur poste FM24" value={bestPoste} />
      </div>
    </div>
  );
}
