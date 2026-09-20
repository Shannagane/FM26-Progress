import { useMemo, useState } from 'react';
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

// Choix en brouillon tant qu'on n'a pas cliqué "Appliquer" (résumé live dans le footer) : le
// club/import réellement affiché sur la page (props `selectedClub`/`selectedSnapshotId`) n'est
// modifié qu'au moment d'onApply — "Annuler"/la croix referment sans rien changer, l'état
// brouillon disparaissant simplement avec le démontage de la modale.
export default function DepthClubModal({
  clubs, importsByClub,
  selectedClub, selectedSnapshotId,
  formationLabel,
  onApply, onClose
}) {
  const logos = useMemo(() => loadClubLogos(), []);
  const [draftClub, setDraftClub] = useState(selectedClub);
  const [draftSnapshotId, setDraftSnapshotId] = useState(selectedSnapshotId);
  const imports = (draftClub && importsByClub.get(draftClub)) || [];
  const applyDisabled = !draftClub || !draftSnapshotId;
  const summary = `${draftClub || 'Aucun club'} • ${formationLabel}`;

  function pickClub(club) {
    setDraftClub(club);
    setDraftSnapshotId(importsByClub.get(club)?.[0]?.id || null);
  }

  function handleApply() {
    onApply(draftClub, draftSnapshotId);
  }

  return (
    <DepthModalShell
      title="CLUB"
      summary={summary}
      onCancel={onClose}
      onApply={handleApply}
      onClose={onClose}
      applyDisabled={applyDisabled}
    >
      <section className="depth-config-block">
        <h3 className="depth-config-block-title">Choisir le club</h3>
        <div className="depth-config-club-grid">
          {clubs.map(club => (
            <button
              type="button"
              key={club}
              className={`depth-config-club-card ${draftClub === club ? 'depth-config-club-card-active' : ''}`}
              onClick={() => pickClub(club)}
            >
              {draftClub === club && <span className="depth-config-check">✓</span>}
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

      {draftClub && (
        <section className="depth-config-block">
          <h3 className="depth-config-block-title">Choisir l'import — {draftClub}</h3>
          <div className="depth-config-import-list">
            {imports.map(snap => (
              <button
                type="button"
                key={snap.id}
                className={`depth-config-import-row ${draftSnapshotId === snap.id ? 'depth-config-import-row-active' : ''}`}
                onClick={() => setDraftSnapshotId(snap.id)}
              >
                {draftSnapshotId === snap.id && <span className="depth-config-check">✓</span>}
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
