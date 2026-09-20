import './SquadFilters.css';

export default function SquadFilters({
  search, setSearch, onCreateGroupClick, onGroupFilterClick, onEditColumnsClick
}) {
  return (
    <div className="squad-filters">
      <input
        type="search"
        className="squad-search"
        placeholder="Rechercher un joueur…"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />

      <div className="squad-filters-actions">
        <button type="button" className="squad-new-group-btn" onClick={onCreateGroupClick}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Créer un groupe de joueurs
        </button>
        <button type="button" className="squad-new-group-btn" onClick={onGroupFilterClick}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M5 6h14M8 12h8M11 18h2" strokeLinecap="round" />
          </svg>
          Groupe
        </button>
        <button type="button" className="squad-edit-columns-btn" onClick={onEditColumnsClick}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 20h4.5L19 9.5a2.1 2.1 0 0 0-3-3L5.5 17V20Z" strokeLinejoin="round" />
            <path d="M14.5 8l1.5 1.5" />
          </svg>
          Éditer le tableau
        </button>
      </div>
    </div>
  );
}
