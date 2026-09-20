import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PlayerPlaceholderIcon from './PlayerPlaceholderIcon.jsx';
import AttributesInfo from './AttributesInfo.jsx';
import { isGoalkeeper } from '../../data/positionOrder.js';
import { attributeColorClass } from '../../data/attributesConfig.js';
import { isElectron, loadFacepackFolder, getPlayerPhotoUrl } from '../../utils/facepack.js';
import './PlayerRow.css';

const PHOTO_SIZE = 34;

export default function PlayerRow({ player, showClub, columns }) {
  const navigate = useNavigate();
  const [photoErrored, setPhotoErrored] = useState(false);
  const showPhoto = !photoErrored && isElectron() && !!loadFacepackFolder();

  return (
    <tr className="player-row" onClick={() => navigate(`/joueur/${player.id}`)} tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter') navigate(`/joueur/${player.id}`); }}>
      <td>
        {/* Le flex reste sur ce span interne, pas sur le <td> lui-même : un <td> en
            display:flex sort du modèle de mise en page des tableaux et le calcul de hauteur
            de ligne du navigateur devient alors incohérent avec les autres cellules
            (display: table-cell), d'où les cellules de hauteurs légèrement différentes. */}
        <span className="cell-identity">
          {showPhoto ? (
            <img
              src={getPlayerPhotoUrl(player)}
              alt=""
              className="player-photo"
              style={{ width: PHOTO_SIZE, height: PHOTO_SIZE }}
              onError={() => setPhotoErrored(true)}
            />
          ) : (
            <PlayerPlaceholderIcon size={PHOTO_SIZE} />
          )}
          <span className="player-name">{player.nom}</span>
          <AttributesInfo player={player} />
        </span>
      </td>
      <td>
        <span className={`position-badge ${isGoalkeeper(player.poste) ? 'position-gk' : ''}`}>
          {player.poste || '–'}
        </span>
      </td>
      {showClub && <td className="cell-club">{player.importClub || '–'}</td>}
      {columns.map(col => {
        const isAttr = col.key.startsWith('attr:');
        const value = col.getDisplayValue(player);
        return (
          <td
            key={col.key}
            className={`${col.numeric ? 'cell-numeric' : ''} ${isAttr ? attributeColorClass(value) : ''}`}
          >
            {value}
          </td>
        );
      })}
    </tr>
  );
}
