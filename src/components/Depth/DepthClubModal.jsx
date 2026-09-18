import React, { useMemo } from 'react';
import { loadClubLogos } from '../../utils/clubLogos.js';
import DepthModalShell from './DepthModalShell.jsx';

function clubInitials(name) {
  return (name || '').trim().split(/\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase() || '?';
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

export default function DepthClubModal({
  clubs, importsByClub,
  selectedClub, onSelectClub,
  selectedSnapshotId, onSelectSnapshot,
  summary, onCancel, onApply
}) {
  const logos = useMemo(() => loadClubLogos(), []);
  const imports = (selectedClub && importsByClub.get(selectedClub)) || [];
  const applyDisabled = !selectedClub || !selectedSnapshotId;

  return (
    <DepthModalShell title="CLUB" summary={summary} onCancel={onCancel} onApply={onApply} applyDisabled={applyDisabled}>
      <section className="depth-config-block">
        <h3 className="depth-config-block-title">Choisir le club</h3>
        <div className="depth-config-club-grid">
          {clubs.map(club => (
            <button
              type="button"
              key={club}
              className={`depth-config-club-card ${selectedClub === club ? 'depth-config-club-card-active' : ''}`}
              onClick={() => onSelectClub(club)}
            >
              {selectedClub === club && <span className="depth-config-check">✓</span>}
              {logos[club]
                ? <img className="depth-config-club-logo" src={logos[club]} alt="" />
                : <span className="depth-config-club-logo depth-config-club-logo-fallback">{clubInitials(club)}</span>}
              <span className="depth-config-club-name">{club}</span>
            </button>
          ))}
          {clubs.length === 0 && (
            <p className="depth-config-empty-hint">Aucun club détecté dans l'effectif importé.</p>
          )}
        </div>
      </section>

      {selectedClub && (
        <section className="depth-config-block">
          <h3 className="depth-config-block-title">Choisir l'import — {selectedClub}</h3>
          <div className="depth-config-import-list">
            {imports.map(snap => (
              <button
                type="button"
                key={snap.id}
                className={`depth-config-import-row ${selectedSnapshotId === snap.id ? 'depth-config-import-row-active' : ''}`}
                onClick={() => onSelectSnapshot(snap.id)}
              >
                {selectedSnapshotId === snap.id && <span className="depth-config-check">✓</span>}
                <span className="depth-config-import-date">{formatDate(snap.gameDate)}</span>
                <span className="depth-config-import-count">{Object.keys(snap.players).length} joueur(s)</span>
              </button>
            ))}
            {imports.length === 0 && (
              <p className="depth-config-empty-hint">Aucun import pour ce club.</p>
            )}
          </div>
        </section>
      )}
    </DepthModalShell>
  );
}
