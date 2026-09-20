import { useState } from 'react';
import JerseyNumberBadge from './JerseyNumberBadge.jsx';
import './PlayerAvatar.css';

// Si une photo est fournie (et se charge correctement) elle est affichée.
// Sinon on retombe sur le badge numéro de maillot / couleur de poste,
// identique à celui utilisé sur la page Effectif.
export default function PlayerAvatar({ nom, photo, numero, poste, size = 40 }) {
  const [errored, setErrored] = useState(false);

  if (photo && !errored) {
    return (
      <img
        src={photo}
        alt={nom}
        className="player-avatar player-avatar-img"
        style={{ width: size, height: size }}
        onError={() => setErrored(true)}
      />
    );
  }

  return <JerseyNumberBadge numero={numero} poste={poste} size={size} />;
}
