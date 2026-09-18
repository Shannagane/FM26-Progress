import React, { useEffect, useMemo, useState } from 'react';
import { ALL_COLUMNS, COLUMN_BY_KEY, COLUMN_GROUPS, DEFAULT_COLUMN_KEYS } from '../../data/columnsConfig.js';
import { normalize } from '../../utils/text.js';
import './EditColumnsModal.css';

function DragHandleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="9" cy="6" r="1.6" /><circle cx="9" cy="12" r="1.6" /><circle cx="9" cy="18" r="1.6" />
      <circle cx="15" cy="6" r="1.6" /><circle cx="15" cy="12" r="1.6" /><circle cx="15" cy="18" r="1.6" />
    </svg>
  );
}

// Liste réordonnable des colonnes actuellement affichées : glisser-déposer (souris) et
// boutons haut/bas (clavier, tactile) pour changer l'ordre des colonnes du tableau Effectif.
function ActiveColumnsList({ keys, onReorder, onRemove }) {
  const [dragIndex, setDragIndex] = useState(null);

  if (keys.length === 0) {
    return <p className="edit-columns-active-empty">Aucune colonne sélectionnée pour l'instant.</p>;
  }

  return (
    <div className="edit-columns-active-list">
      {keys.map((key, index) => {
        const col = COLUMN_BY_KEY[key];
        if (!col) return null;
        return (
          <div
            key={key}
            className={`edit-columns-active-item ${dragIndex === index ? 'edit-columns-active-item-dragging' : ''}`}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={e => e.preventDefault()}
            onDrop={() => {
              if (dragIndex !== null && dragIndex !== index) onReorder(dragIndex, index);
              setDragIndex(null);
            }}
            onDragEnd={() => setDragIndex(null)}
          >
            <span className="edit-columns-drag-handle"><DragHandleIcon /></span>
            <span className="edit-columns-active-label">{col.label}</span>
            <div className="edit-columns-active-controls">
              <button
                type="button"
                disabled={index === 0}
                onClick={() => onReorder(index, index - 1)}
                aria-label={`Monter ${col.label}`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 14l6-6 6 6" /></svg>
              </button>
              <button
                type="button"
                disabled={index === keys.length - 1}
                onClick={() => onReorder(index, index + 1)}
                aria-label={`Descendre ${col.label}`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 10l6 6 6-6" /></svg>
              </button>
              <button
                type="button"
                className="edit-columns-active-remove"
                onClick={() => onRemove(key)}
                aria-label={`Retirer ${col.label}`}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 6l12 12M18 6L6 18" /></svg>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Modale de personnalisation du tableau Effectif : choisir, parmi toutes les infos et
// attributs disponibles, les colonnes affichées en plus de Joueur / Meilleur poste (et Club),
// et régler leur ordre d'affichage.
export default function EditColumnsModal({ selectedKeys, onClose, onSave }) {
  const [orderedKeys, setOrderedKeys] = useState(() => selectedKeys.filter(key => COLUMN_BY_KEY[key]));
  const [search, setSearch] = useState('');

  const selectedSet = useMemo(() => new Set(orderedKeys), [orderedKeys]);

  useEffect(() => {
    function onKeyDown(e) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const groupedColumns = useMemo(() => {
    const q = normalize(search);
    return COLUMN_GROUPS
      .map(group => ({
        group,
        columns: ALL_COLUMNS.filter(c => c.group === group && (!q || normalize(c.label).includes(q)))
      }))
      .filter(g => g.columns.length > 0);
  }, [search]);

  function toggle(key) {
    setOrderedKeys(prev => (
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    ));
  }

  function remove(key) {
    setOrderedKeys(prev => prev.filter(k => k !== key));
  }

  function reorder(fromIndex, toIndex) {
    setOrderedKeys(prev => {
      if (toIndex < 0 || toIndex >= prev.length) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }

  function handleReset() {
    setOrderedKeys([...DEFAULT_COLUMN_KEYS]);
  }

  function handleSave() {
    onSave(orderedKeys);
  }

  return (
    <div className="group-modal-overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="group-modal edit-columns-modal" role="dialog" aria-modal="true" aria-label="Éditer le tableau">
        <div className="group-modal-header">
          <h3>Éditer le tableau</h3>
          <button type="button" className="group-modal-close" onClick={onClose} aria-label="Fermer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="edit-columns-body">
          <div className="edit-columns-section">
            <div className="group-modal-players-header">
              <span>
                {orderedKeys.length} colonne{orderedKeys.length > 1 ? 's' : ''} affichée{orderedKeys.length > 1 ? 's' : ''}
                {' · '}glisse pour réordonner
              </span>
            </div>
            <ActiveColumnsList keys={orderedKeys} onReorder={reorder} onRemove={remove} />
          </div>

          <div className="edit-columns-section edit-columns-picker">
            <div className="group-modal-players-header">
              <span>Ajouter une colonne</span>
              <input
                type="search"
                className="group-modal-search"
                placeholder="Rechercher une colonne…"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            <div className="edit-columns-list">
              {groupedColumns.length === 0 && (
                <p className="group-modal-empty">Aucune colonne ne correspond à cette recherche.</p>
              )}
              {groupedColumns.map(({ group, columns }) => (
                <div className="edit-columns-group" key={group}>
                  <h4>{group}</h4>
                  <div className="edit-columns-grid">
                    {columns.map(col => {
                      const checked = selectedSet.has(col.key);
                      return (
                        <label key={col.key} className={`edit-columns-item ${checked ? 'edit-columns-item-checked' : ''}`}>
                          <input type="checkbox" checked={checked} onChange={() => toggle(col.key)} />
                          <span>{col.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="group-modal-actions">
          <button type="button" className="group-modal-secondary edit-columns-reset" onClick={handleReset}>
            Réinitialiser
          </button>
          <button type="button" className="group-modal-secondary" onClick={onClose}>
            Annuler
          </button>
          <button type="button" className="group-modal-confirm" onClick={handleSave}>
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
