import { getNationFlagCode } from '../../data/nationFlags.js';
import './NationFlag.css';

// Affiche le drapeau (image SVG) correspondant à la nation d'un joueur
// (colonne "Nation" du CSV FM26). N'affiche rien si la nation est absente
// ou non reconnue, plutôt qu'un symbole cassé.
export default function NationFlag({ nation }) {
  const code = nation ? getNationFlagCode(nation) : null;
  if (!code) return null;

  return (
    <span
      className={`fi fi-${code} nation-flag`}
      role="img"
      aria-label={nation}
      title={nation}
    />
  );
}
