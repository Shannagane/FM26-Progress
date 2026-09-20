import { useEffect, useState } from 'react';
import './ChoixClubModal.css';
import './ChoixGroupeModal.css';

const CLOSE_ANIM_MS = 180;
const ALL_PLAYERS = null;

// Modale ouverte depuis le bouton "Groupe" de la page Effectif : liste les groupes
// personnalisés existants pour le club affiché, plus une entrée "Tous les joueurs" pour
// retirer le filtre. Même comportement brouillon + Appliquer/Annuler que ChoixClubModal.
export default function ChoixGroupeModal({ groups, selectedGroupId, onApply, onDeleteGroup, onClose }) {
  const [draftGroupId, setDraftGroupId] = useState(selectedGroupId);
  const [closing, setClosing] = useState(false);

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

  // Le groupe en cours de sélection peut disparaître (suppression) pendant que la modale
  // reste ouverte : on revient sur "Tous les joueurs" plutôt que de garder un id fantôme.
  useEffect(() => {
    if (draftGroupId && !groups.some(g => g.id === draftGroupId)) {
      setDraftGroupId(ALL_PLAYERS);
    }
  }, [groups, draftGroupId]);

  function handleApply() {
    if (closing) return;
    setClosing(true);
    onApply(draftGroupId);
    setTimeout(onClose, CLOSE_ANIM_MS);
  }

  const draftGroup = groups.find(g => g.id === draftGroupId) || null;

  return (
    <div
      className={`clubmodal-overlay ${closing ? 'clubmodal-overlay-closing' : ''}`}
      onMouseDown={e => { if (e.target === e.currentTarget) requestClose(); }}
    >
      <div className="clubmodal" role="dialog" aria-modal="true" aria-label="Choix de groupe">
        <div className="clubmodal-header">
          <h3>Choix de groupe</h3>
          <button type="button" className="clubmodal-close" onClick={requestClose} aria-label="Fermer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="clubmodal-body">
          <div className="clubmodal-list">
            <button
              type="button"
              className={`clubmodal-item ${draftGroupId === ALL_PLAYERS ? 'clubmodal-item-active' : ''}`}
              onClick={() => setDraftGroupId(ALL_PLAYERS)}
            >
              <span className="clubmodal-item-name">Tous les joueurs</span>
            </button>

            {groups.length === 0 && (
              <p className="clubmodal-empty">Aucun groupe créé pour ce club.</p>
            )}
            {groups.map(group => (
              <div
                key={group.id}
                className={`clubmodal-item choixgroupe-item ${draftGroupId === group.id ? 'clubmodal-item-active' : ''}`}
              >
                <button
                  type="button"
                  className="choixgroupe-item-select"
                  onClick={() => setDraftGroupId(group.id)}
                >
                  <span className="clubmodal-item-name">{group.name}</span>
                  <span className="clubmodal-item-count">{group.playerIds.length} joueur(s)</span>
                </button>
                <button
                  type="button"
                  className="choixgroupe-item-delete"
                  onClick={() => onDeleteGroup(group.id, group.name)}
                  aria-label={`Supprimer le groupe ${group.name}`}
                  title="Supprimer ce groupe"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m2 0-.8 12.2a2 2 0 0 1-2 1.8H8.8a2 2 0 0 1-2-1.8L6 7" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="clubmodal-footer">
          <span className="clubmodal-summary">
            Groupe • {draftGroup ? draftGroup.name : 'Tous les joueurs'}
          </span>
          <div className="clubmodal-footer-actions">
            <button type="button" className="clubmodal-cancel" onClick={requestClose}>Annuler</button>
            <button type="button" className="clubmodal-apply" onClick={handleApply}>
              Appliquer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
