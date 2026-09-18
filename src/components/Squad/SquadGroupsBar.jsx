import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SquadGroupsBar.css';

export default function SquadGroupsBar({ groups, onCreateGroupClick, onEditColumnsClick }) {
  const navigate = useNavigate();

  function handleChange(e) {
    const groupId = e.target.value;
    if (groupId) navigate(`/effectif/groupe/${groupId}`);
  }

  return (
    <div className="squad-groups-bar">
      {groups.length > 0 && (
        <label className="squad-groups-select">
          <span>Affichage du groupe</span>
          <select value="" onChange={handleChange}>
            <option value="">Choisir un groupe…</option>
            {groups.map(g => (
              <option key={g.id} value={g.id}>{g.name}</option>
            ))}
          </select>
        </label>
      )}
      <div className="squad-groups-actions">
        <button type="button" className="squad-edit-columns-btn" onClick={onEditColumnsClick}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 20h4.5L19 9.5a2.1 2.1 0 0 0-3-3L5.5 17V20Z" strokeLinejoin="round" />
            <path d="M14.5 8l1.5 1.5" />
          </svg>
          Éditer le tableau
        </button>
        <button type="button" className="squad-new-group-btn" onClick={onCreateGroupClick}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Créer un groupe de joueurs
        </button>
      </div>
    </div>
  );
}
