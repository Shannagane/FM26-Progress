import { useState } from 'react';
import { getPlayerSnapshots } from '../../utils/storage.js';
import './PersonalityTab.css';

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

function Block({ label, value }) {
  return (
    <div className="personality-block">
      <span className="personality-label">{label}</span>
      <p className="personality-value">{value || 'Non renseigné dans le CSV'}</p>
    </div>
  );
}

function PersonalityFields({ data }) {
  return (
    <>
      <div className="personality-row">
        <Block label="Personnalité" value={data.personnalite} />
        <Block label="Rapports média" value={data.rapports_media} />
      </div>
      <div className="personality-row">
        <Block label="Projet à court terme" value={data.projet_court_terme} />
        <Block label="Projet à long terme" value={data.projet_long_terme} />
      </div>
    </>
  );
}

export default function PersonalityTab({ player, snapshots }) {
  const history = getPlayerSnapshots(snapshots, player.id); // ordre chronologique croissant
  const descending = [...history].reverse(); // le plus récent en premier
  const [openIndexes, setOpenIndexes] = useState({});

  function toggle(i) {
    setOpenIndexes(prev => ({ ...prev, [i]: !prev[i] }));
  }

  if (descending.length === 0) {
    return (
      <div className="personality-tab">
        <PersonalityFields data={player} />
      </div>
    );
  }

  const [latest, ...previous] = descending;

  return (
    <div className="personality-tab">
      <div className="personality-current">
        <div className="personality-current-header">
          <span className="personality-current-badge">Actuel</span>
          <span className="personality-current-meta">{latest.csvName || 'Import'} · {formatDate(latest.gameDate)}</span>
        </div>
        <PersonalityFields data={latest.player} />
      </div>

      {previous.length > 0 && (
        <div className="personality-history">
          <h3 className="personality-history-title">Imports précédents</h3>
          {previous.map((entry, idx) => {
            const isOpen = !!openIndexes[idx];
            return (
              <div
                className={`personality-history-card ${isOpen ? 'personality-history-card-open' : ''}`}
                key={`${entry.gameDate}-${entry.csvName}-${idx}`}
              >
                <button
                  type="button"
                  className="personality-history-header"
                  onClick={() => toggle(idx)}
                  aria-expanded={isOpen}
                >
                  <svg
                    className={`personality-history-chevron ${isOpen ? 'personality-history-chevron-open' : ''}`}
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
                  >
                    <path d="M9 6l6 6-6 6" />
                  </svg>
                  <span className="personality-history-name">{entry.csvName || 'Import'}</span>
                  <span className="personality-history-date">{formatDate(entry.gameDate)}</span>
                  <span className="personality-history-imported">Importé le {formatDateTime(entry.importDate)}</span>
                </button>
                {isOpen && (
                  <div className="personality-history-body">
                    <PersonalityFields data={entry.player} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
