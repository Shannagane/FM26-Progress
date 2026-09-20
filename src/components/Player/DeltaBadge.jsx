import './DeltaBadge.css';

export default function DeltaBadge({ delta }) {
  if (delta === null || delta === undefined || Number.isNaN(delta)) return null;
  // Arrondi à 2 décimales avant affichage : une simple soustraction de deux valeurs
  // décimales (ex. notes moyennes 7.10 - 6.90) peut produire du bruit flottant
  // (0.19999999999999973) sinon affiché tel quel.
  const rounded = Math.round(delta * 100) / 100;
  if (rounded === 0) return null;
  const positive = rounded > 0;
  return (
    <span className={`delta-badge ${positive ? 'delta-up' : 'delta-down'}`}>
      {positive ? `+${rounded}` : rounded}
    </span>
  );
}
