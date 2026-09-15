import React from 'react';
import { useNavigate } from 'react-router-dom';
import JerseyNumberBadge from './JerseyNumberBadge.jsx';
import { isGoalkeeper } from '../../data/positionOrder.js';
import './PlayerRow.css';

export default function PlayerRow({ player, showClub }) {
  const navigate = useNavigate();

  return (
    <tr className="player-row" onClick={() => navigate(`/joueur/${player.id}`)} tabIndex={0}
        onKeyDown={e => { if (e.key === 'Enter') navigate(`/joueur/${player.id}`); }}>
      <td className="cell-identity">
        <JerseyNumberBadge numero={player.numero} poste={player.poste} size={34} />
        <span className="player-name">{player.nom}</span>
      </td>
      <td>
        <span className={`position-badge ${isGoalkeeper(player.poste) ? 'position-gk' : ''}`}>
          {player.poste || '–'}
        </span>
      </td>
      {showClub && <td className="cell-club">{player.importClub || '–'}</td>}
      <td>{player.age || '–'}</td>
      <td className="cell-numeric">{player.matchs_joues ?? '–'}</td>
      <td className="cell-numeric">{player.buts ?? '–'}</td>
      <td className="cell-numeric">{player.passes_decisives ?? '–'}</td>
      <td className="cell-numeric">{player.note_moyenne ?? '–'}</td>
    </tr>
  );
}
