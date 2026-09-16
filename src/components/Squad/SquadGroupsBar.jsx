import React from 'react';
import { useNavigate } from 'react-router-dom';
import './SquadGroupsBar.css';

export default function SquadGroupsBar({ groups, onCreateGroupClick }) {
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
      <button type="button" className="squad-new-group-btn" onClick={onCreateGroupClick}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
          <path d="M12 5v14M5 12h14" />
        </svg>
        Créer un groupe de joueurs
      </button>
    </div>
  );
}
