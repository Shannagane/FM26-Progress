import React, { useEffect, useMemo, useState } from 'react';
import { loadClubLogos } from '../../utils/clubLogos.js';
import './ChoixClubModal.css';

const CLOSE_ANIM_MS = 180;

function ClubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
      <path d="M12 3l7 3v5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V6Z" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4.5" />
    </svg>
  );
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

function mostRecentImportId(snapshots, club) {
  const imports = snapshots
    .filter(s => (s.csvName || '').trim() === club)
    .sort((a, b) => new Date(b.gameDate) - new Date(a.gameDate));
  return imports[0]?.id || null;
}

// Modale ouverte depuis le bouton "Choix du club" de la page Effectif : un onglet pour
// choisir un club déjà importé, un autre pour choisir, parmi les imports de CE club, celui
// dont on veut voir l'état. Les choix restent en brouillon (résumé live dans le footer) tant
// qu'on n'a pas cliqué "Appliquer" — "Annuler" ferme sans rien changer.
export default function ChoixClubModal({
  clubs, players, snapshots, selectedClub, selectedSnapshotId, onApply, onClose
}) {
  const [tab, setTab] = useState('club');
  const [draftClub, setDraftClub] = useState(selectedClub);
  const [draftSnapshotId, setDraftSnapshotId] = useState(selectedSnapshotId);
  const [closing, setClosing] = useState(false);
  const logos = useMemo(() => loadClubLogos(), []);

  const clubCounts = useMemo(() => {
    const counts = new Map();
    players.forEach(p => {
      const club = (p.importClub || '').trim();
      if (!club) return;
      counts.set(club, (counts.get(club) || 0) + 1);
    });
    return clubs.map(club => ({ club, count: counts.get(club) || 0 }));
  }, [clubs, players]);

  const clubImports = useMemo(() => (
    snapshots
      .filter(s => (s.csvName || '').trim() === draftClub)
      .sort((a, b) => new Date(b.gameDate) - new Date(a.gameDate))
  ), [snapshots, draftClub]);

  const draftSnapshot = useMemo(
    () => snapshots.find(s => s.id === draftSnapshotId) || null,
    [snapshots, draftSnapshotId]
  );

  function requestClose() {
    if (closing) return;
    onClose();
  }

  useEffect(() => {
    function onKeyDown(e) { if (e.key === 'Escape') requestClose(); }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closing]);

  function pickClub(club) {
    setDraftClub(club);
    setDraftSnapshotId(mostRecentImportId(snapshots, club));
    setTab('import');
  }

  function pickSnapshot(snapshotId) {
    setDraftSnapshotId(snapshotId);
  }

  function handleApply() {
    if (closing) return;
    setClosing(true);
    onApply(draftClub, draftSnapshotId);
    setTimeout(onClose, CLOSE_ANIM_MS);
  }

  return (
    <div
      className={`clubmodal-overlay ${closing ? 'clubmodal-overlay-closing' : ''}`}
      onMouseDown={e => { if (e.target === e.currentTarget) requestClose(); }}
    >
      <div className="clubmodal" role="dialog" aria-modal="true" aria-label="Choix du club">
        <div className="clubmodal-header">
          <h3>Choix du club</h3>
          <button type="button" className="clubmodal-close" onClick={requestClose} aria-label="Fermer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="clubmodal-tabs">
          <button
            type="button"
            className={`clubmodal-tab ${tab === 'club' ? 'clubmodal-tab-active' : ''}`}
            onClick={() => setTab('club')}
          >
            Choisir un club
          </button>
          <button
            type="button"
            className={`clubmodal-tab ${tab === 'import' ? 'clubmodal-tab-active' : ''}`}
            onClick={() => setTab('import')}
          >
            Choisir son import
          </button>
        </div>

        <div className="clubmodal-body">
          {tab === 'club' && (
            <div className="clubmodal-list">
              {clubCounts.length === 0 && (
                <p className="clubmodal-empty">Aucun club importé pour le moment.</p>
              )}
              {clubCounts.map(({ club, count }) => (
                <button
                  key={club}
                  type="button"
                  className={`clubmodal-item ${draftClub === club ? 'clubmodal-item-active' : ''}`}
                  onClick={() => pickClub(club)}
                >
                  <span className="clubmodal-item-logo">
                    {logos[club] ? <img src={logos[club]} alt="" /> : <ClubIcon />}
                  </span>
                  <span className="clubmodal-item-name">{club}</span>
                  <span className="clubmodal-item-count">{count} joueur(s)</span>
                </button>
              ))}
            </div>
          )}

          {tab === 'import' && (
            <div className="clubmodal-list">
              {clubImports.length === 0 && (
                <p className="clubmodal-empty">Aucun import pour {draftClub}.</p>
              )}
              {clubImports.map(snap => (
                <button
                  key={snap.id}
                  type="button"
                  className={`clubmodal-item ${draftSnapshotId === snap.id ? 'clubmodal-item-active' : ''}`}
                  onClick={() => pickSnapshot(snap.id)}
                >
                  <span className="clubmodal-item-name">{formatDate(snap.gameDate)}</span>
                  <span className="clubmodal-item-count">{Object.keys(snap.players).length} joueur(s)</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="clubmodal-footer">
          <span className="clubmodal-summary">
            {draftClub || '—'} • {draftSnapshot ? formatDate(draftSnapshot.gameDate) : '—'}
          </span>
          <div className="clubmodal-footer-actions">
            <button type="button" className="clubmodal-cancel" onClick={requestClose}>Annuler</button>
            <button type="button" className="clubmodal-apply" onClick={handleApply} disabled={!draftClub}>
              Appliquer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
