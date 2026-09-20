import './PlayerPlaceholderIcon.css';

// Icône neutre (silhouette + cercle en pointillé) affichée à la place du badge numéro de
// maillot dans le tableau de la page Effectif.
export default function PlayerPlaceholderIcon({ size = 34 }) {
  return (
    <svg
      className="player-placeholder-icon"
      style={{ width: size, height: size }}
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle cx="12" cy="12" r="11" stroke="currentColor" strokeWidth="1.4" strokeDasharray="2.6 2.6" />
      <circle cx="12" cy="9.6" r="3.1" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5.6 18.7c1.15-2.9 3.65-4.4 6.4-4.4s5.25 1.5 6.4 4.4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}
