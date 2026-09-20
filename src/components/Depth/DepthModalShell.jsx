import { useEffect, useState } from 'react';
import './DepthConfigModal.css';

const CLOSE_ANIM_MS = 180;

// Coquille commune aux 4 modales de réglage (Formation / Club / Méthode) : même overlay flou
// plein écran, header titre + croix, footer avec résumé live en mono et Annuler/Appliquer.
// "Annuler" ferme aussitôt (et fait revenir l'appelant à l'état d'avant ouverture) ;
// "Appliquer" déclenche onApply immédiatement puis referme avec un fondu.
export default function DepthModalShell({ title, onCancel, onApply, onClose, applyDisabled, summary, children }) {
  const [closing, setClosing] = useState(false);

  function requestCancel() {
    if (closing) return;
    onCancel();
  }

  useEffect(() => {
    function onKeyDown(e) { if (e.key === 'Escape') requestCancel(); }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closing]);

  function handleApply() {
    if (closing || applyDisabled) return;
    setClosing(true);
    onApply();
    setTimeout(onClose, CLOSE_ANIM_MS);
  }

  return (
    <div
      className={`depth-config-overlay ${closing ? 'depth-config-overlay-closing' : ''}`}
      onMouseDown={e => { if (e.target === e.currentTarget) requestCancel(); }}
    >
      <div className="depth-config-modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="depth-config-header">
          <h2 className="depth-config-title">{title}</h2>
          <button type="button" className="depth-config-close" onClick={requestCancel} aria-label="Fermer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="depth-config-body">
          {children}
        </div>

        <div className="depth-config-footer">
          <span className="depth-config-summary">{summary}</span>
          <div className="depth-config-footer-actions">
            <button type="button" className="depth-config-cancel" onClick={requestCancel}>Annuler</button>
            <button type="button" className="depth-config-apply" onClick={handleApply} disabled={applyDisabled}>
              Appliquer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
