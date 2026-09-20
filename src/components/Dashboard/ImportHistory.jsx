import { useMemo, useState } from 'react';
import { useAppData } from '../../context/AppContext.jsx';
import './ImportHistory.css';

const ALL_CLUBS = '__all__';

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

function formatDateTime(iso) {
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  } catch {
    return iso;
  }
}

export default function ImportHistory() {
  const { snapshots, resetAll, deleteImport } = useAppData();
  const [selectedClub, setSelectedClub] = useState(ALL_CLUBS);

  const clubs = useMemo(() => {
    const set = new Set(snapshots.map(s => (s.csvName || '').trim()).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'fr'));
  }, [snapshots]);

  function handleDelete(snap) {
    const label = snap.csvName || 'cet import';
    if (confirm(`Supprimer l'import « ${label} » (${formatDate(snap.gameDate)}) ? Cette action est irréversible.`)) {
      deleteImport(snap.id);
    }
  }

  if (snapshots.length === 0) {
    return (
      <div className="import-history import-history-empty">
        <p>Aucun import pour le moment. Charge un premier CSV pour commencer à suivre tes joueurs.</p>
      </div>
    );
  }

  const ordered = snapshots
    .filter(snap => selectedClub === ALL_CLUBS || (snap.csvName || '').trim() === selectedClub)
    .sort((a, b) => new Date(b.gameDate) - new Date(a.gameDate));

  return (
    <div className="import-history">
      <div className="import-history-header">
        <h3>Historique des imports</h3>
        <div className="import-history-header-actions">
          {clubs.length > 1 && (
            <label className="import-club-select">
              <span>Club</span>
              <select value={selectedClub} onChange={e => setSelectedClub(e.target.value)}>
                <option value={ALL_CLUBS}>Tous les clubs ({clubs.length})</option>
                {clubs.map(club => (
                  <option key={club} value={club}>{club}</option>
                ))}
              </select>
            </label>
          )}
          <button className="reset-btn" onClick={() => {
            if (confirm('Supprimer tout l\'historique importé ? Cette action est irréversible.')) resetAll();
          }}>
            Réinitialiser
          </button>
        </div>
      </div>
      {ordered.length === 0 && (
        <p className="import-history-empty-filter">Aucun import pour ce club.</p>
      )}
      <ul className="import-history-list">
        {ordered.map(snap => (
          <li key={snap.id}>
            <span className="import-name">
              {snap.csvName || 'Import'}
            </span>
            <span className="import-meta">
              <span className="import-meta-label">Date en jeu</span>
              {formatDate(snap.gameDate)}
            </span>
            <span className="import-meta">
              <span className="import-meta-label">Importé le</span>
              {formatDateTime(snap.importDate)}
            </span>
            <span className="import-count">{Object.keys(snap.players).length} joueur(s)</span>
            <button
              type="button"
              className="import-delete-btn"
              onClick={() => handleDelete(snap)}
              aria-label={`Supprimer l'import ${snap.csvName || ''}`}
              title="Supprimer cet import"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M4 7h16" />
                <path d="M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                <path d="M6 7l1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" />
                <path d="M10 11v6M14 11v6" />
              </svg>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
