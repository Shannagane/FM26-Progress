import React, { useState } from 'react';
import './ViewDownloadCard.css';

// Doit correspondre au nom réel du fichier dans public/.
const RELATIVE_PATH = 'Csv export.fmf';
const SUGGESTED_NAME = 'FM26-Progress-Tracker.fmf';

// import.meta.env.BASE_URL respecte le "base: './'" de Vite : le lien de secours (web)
// fonctionne aussi bien servi par un serveur que dans un simple dossier statique.
// encodeURI gère l'espace dans le nom de fichier.
const VIEW_URL = `${import.meta.env.BASE_URL}${encodeURI(RELATIVE_PATH)}`;

export default function ViewDownloadCard() {
  const [status, setStatus] = useState(null); // 'saved' | 'error' | null
  const isElectron = typeof window !== 'undefined' && window.electronAPI?.isElectron;

  async function handleClick(e) {
    if (!isElectron) return; // laisse le <a href download> agir normalement (version web)
    e.preventDefault();
    setStatus(null);
    try {
      const result = await window.electronAPI.saveBundledFile(RELATIVE_PATH, SUGGESTED_NAME);
      if (result.success) setStatus('saved');
      else if (!result.canceled) setStatus('error');
    } catch {
      setStatus('error');
    }
  }

  return (
    <div className="view-download-card">
      <div className="view-download-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M14 3v5h5" />
          <path d="M6 3h8l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
          <path d="M9 14h6M9 17h4" />
        </svg>
      </div>
      <div className="view-download-text">
        <h3>Vue « FM26 Progress Tracker »</h3>
        <p>
          La vue personnalisée à importer dans FM26 : elle affiche exactement les colonnes
          reconnues par l'application.
        </p>
        {status === 'saved' && <p className="view-download-status view-download-status-ok">Vue enregistrée avec succès.</p>}
        {status === 'error' && <p className="view-download-status view-download-status-error">L'enregistrement a échoué, réessaie.</p>}
      </div>
      <a
        className="view-download-btn"
        href={VIEW_URL}
        download={SUGGESTED_NAME}
        onClick={handleClick}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M12 3v12m0 0-4-4m4 4 4-4" />
          <path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
        </svg>
        Télécharger la vue (.fmf)
      </a>
    </div>
  );
}
