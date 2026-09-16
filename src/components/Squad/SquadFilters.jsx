import React from 'react';
import { POSITION_CATEGORIES } from '../../data/positionCategories.js';
import './SquadFilters.css';

const CATEGORY_BUTTONS = POSITION_CATEGORIES.filter(cat => cat.key !== 'autre');

export default function SquadFilters({ search, setSearch, clubs, selectedClub, setSelectedClub, selectedCategories, onToggleCategory }) {
  return (
    <div className="squad-filters">
      <input
        type="search"
        className="squad-search"
        placeholder="Rechercher un joueur…"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <div className="squad-category-filters">
        {CATEGORY_BUTTONS.map(cat => (
          <button
            key={cat.key}
            type="button"
            className={`squad-category-btn squad-category-btn-${cat.color} ${selectedCategories.has(cat.key) ? 'squad-category-btn-active' : ''}`}
            aria-pressed={selectedCategories.has(cat.key)}
            onClick={() => onToggleCategory(cat.key)}
          >
            {cat.label}
          </button>
        ))}
      </div>

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
