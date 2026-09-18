import React from 'react';
import { useNavigate } from 'react-router-dom';
import JerseyNumberBadge from './JerseyNumberBadge.jsx';
import AttributesInfo from './AttributesInfo.jsx';
import { isGoalkeeper } from '../../data/positionOrder.js';
import { attributeColorClass } from '../../data/attributesConfig.js';
import './PlayerRow.css';

export default function PlayerRow({ player, showClub, columns }) {
  const navigate = useNavigate();

  return (
    <tr className="player-row" onClick={() => navigate(`/joueur/${player.id}`)} tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter') navigate(`/joueur/${player.id}`); }}>
      <td className="cell-identity">
        <JerseyNumberBadge numero={player.numero} poste={player.poste} size={34} />
        <span className="player-name">{player.nom}</span>
        <AttributesInfo player={player} />
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
