import React, { useState } from 'react';
import { getPlayerSnapshots } from '../../utils/storage.js';
import { getAttributeColumns } from '../../data/attributesConfig.js';
import { isGoalkeeper } from '../../data/positionOrder.js';
import DeltaBadge from './DeltaBadge.jsx';
import HistoryAttributeTable from './HistoryAttributeTable.jsx';
import './HistoryTab.css';

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

const STAT_FIELDS = [
  { key: 'matchs_joues', label: 'MJ' },
  { key: 'buts', label: 'Buts' },
  { key: 'passes_decisives', label: 'Passes D.' },
  { key: 'note_moyenne', label: 'Note' }
];

export default function HistoryTab({ player, snapshots }) {
  const history = getPlayerSnapshots(snapshots, player.id); // ordre chronologique croissant
  const columns = getAttributeColumns(isGoalkeeper(player.poste));
  const categories = columns.flat();
  const [expandedIndex, setExpandedIndex] = useState(null);

  if (history.length === 0) {
    return <p className="history-empty">Aucun import enregistré pour ce joueur.</p>;
  }

  const entries = [...history.keys()].reverse(); // affichage du plus récent au plus ancien

  return (
    <div className="history-tab">
      {entries.map(i => {
        const entry = history[i];
        const prevEntry = i > 0 ? history[i - 1] : null;
        const isExpanded = expandedIndex === i;

        const attrChanges = [];
        categories.forEach(cat => {
          cat.attrs.forEach(a => {
            const cur = entry.player.attributes?.[a.key];
            const prev = prevEntry?.player.attributes?.[a.key];
            if (!prevEntry || cur === undefined || cur === null || prev === undefined || prev === null) return;
            const delta = Number(cur) - Number(prev);
            if (!Number.isNaN(delta) && delta !== 0) {
              attrChanges.push({ label: a.label, delta });
            }
          });
        });

        const statChanges = STAT_FIELDS.map(f => {
          const cur = entry.player[f.key];
          const prev = prevEntry?.player[f.key];
          const hasBoth = prevEntry && cur !== undefined && cur !== '' && prev !== undefined && prev !== '';
          const delta = hasBoth ? Number(cur) - Number(prev) : null;
          return { ...f, value: cur, delta: Number.isNaN(delta) ? null : delta };
        });

        return (
          <div className={`history-entry ${isExpanded ? 'history-entry-expanded' : ''}`} key={`${entry.gameDate}-${entry.csvName}-${i}`}>
            <button
              type="button"
              className="history-entry-header"
              onClick={() => setExpandedIndex(isExpanded ? null : i)}
              aria-expanded={isExpanded}
            >
              <svg
                className={`history-entry-chevron ${isExpanded ? 'history-entry-chevron-open' : ''}`}
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
              >
                <path d="M9 6l6 6-6 6" />
              </svg>
              <div className="history-entry-titles">
                <span className="history-entry-name">{entry.csvName || 'Import'}</span>
                <span className="history-entry-date">{formatDate(entry.gameDate)}</span>
              </div>
              <span className="history-entry-imported">Importé le {formatDateTime(entry.importDate)}</span>
            </button>

            <div className="history-entry-stats">
              {statChanges.map(s => (
                <span className="history-stat" key={s.key}>
                  <span className="history-stat-label">{s.label}</span>
                  <span className="history-stat-value">
                    {(s.value !== undefined && s.value !== null && s.value !== '') ? s.value : '–'}
                    {s.delta ? <DeltaBadge delta={s.delta} /> : null}
                  </span>
                </span>
              ))}
            </div>

            {!prevEntry ? (
              <p className="history-note">Premier import enregistré : ces valeurs servent de référence pour les prochaines comparaisons.</p>
            ) : attrChanges.length === 0 ? (
              <p className="history-note">Aucun changement d'attribut depuis l'import précédent.</p>
            ) : (
              <div className="history-attr-changes">
                {attrChanges
                  .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
                  .map(d => (
                    <span className={`history-chip ${d.delta > 0 ? 'chip-up' : 'chip-down'}`} key={d.label}>
                      {d.label} <strong>{d.delta > 0 ? `+${d.delta}` : d.delta}</strong>
                    </span>
                  ))}
              </div>
            )}

            <button
              type="button"
              className="history-entry-toggle-link"
              onClick={() => setExpandedIndex(isExpanded ? null : i)}
            >
              {isExpanded ? 'Masquer la fiche attributs de cet import' : "Voir la fiche attributs de cet import"}
            </button>

            {isExpanded && (
              <div className="history-attributes-panel">
                <div className="history-attributes-columns">
                  {columns.map((tables, colIndex) => (
                    <div className="history-attributes-column" key={colIndex}>
                      {tables.map(table => (
                        <HistoryAttributeTable
                          key={table.title}
                          title={table.title}
                          attrs={table.attrs}
                          attributes={entry.player.attributes}
                          prevAttributes={prevEntry?.player.attributes}
                        />
                      ))}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
