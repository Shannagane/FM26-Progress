import React, { useEffect } from 'react';
import './DepthConfigModal.css';

// Coquille commune aux 3 modales de réglage (Formation / Club / Méthode) : même overlay flou
// plein écran, header titre + croix, footer avec résumé live en mono et Annuler/Appliquer.
export default function DepthModalShell({ title, onCancel, onApply, applyDisabled, summary, children }) {
  useEffect(() => {
    function onKeyDown(e) { if (e.key === 'Escape') onCancel(); }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onCancel]);

  return (
    <div className="depth-config-overlay" onMouseDown={e => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="depth-config-modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="depth-config-header">
          <h2 className="depth-config-title">{title}</h2>
          <button type="button" className="depth-config-close" onClick={onCancel} aria-label="Fermer">
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
            <button type="button" className="depth-config-cancel" onClick={onCancel}>Annuler</button>
            <button type="button" className="depth-config-apply" onClick={onApply} disabled={applyDisabled}>
              Appliquer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
