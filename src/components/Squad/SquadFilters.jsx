import React from 'react';
import './SquadFilters.css';

export default function SquadFilters({ search, setSearch, clubs, selectedClub, setSelectedClub }) {
  return (
    <div className="squad-filters">
      <input
        type="search"
        className="squad-search"
        placeholder="Rechercher un joueur…"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      {clubs.length > 1 && (
        <label className="squad-club-select">
          <span>Club</span>
          <select value={selectedClub} onChange={e => setSelectedClub(e.target.value)}>
            <option value="__all__">Tous les clubs ({clubs.length})</option>
            {clubs.map(club => (
              <option key={club} value={club}>{club}</option>
            ))}
          </select>
        </label>
      )}

      <span className="squad-filters-hint">Clique sur un en-tête de colonne pour trier</span>
    </div>
  );
}
