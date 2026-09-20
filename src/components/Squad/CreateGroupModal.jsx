import { useEffect, useMemo, useState } from 'react';
import { normalize } from '../../utils/text.js';
import AttributesInfo from './AttributesInfo.jsx';
import './CreateGroupModal.css';

// Sert aussi bien à la création qu'à l'édition d'un groupe : passer `group` pré-remplit le
// nom et la sélection de joueurs et bascule les libellés en mode édition.
export default function CreateGroupModal({ players, group, onClose, onSave }) {
  const isEdit = !!group;
  const [name, setName] = useState(group?.name || '');
  const [search, setSearch] = useState('');
  const [selectedIds, setSelectedIds] = useState(() => new Set(group?.playerIds || []));

  useEffect(() => {
    function onKeyDown(e) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const sortedPlayers = useMemo(() => (
    [...players].sort((a, b) => (a.nom || '').localeCompare(b.nom || '', 'fr'))
  ), [players]);

  const visiblePlayers = useMemo(() => {
    if (!search.trim()) return sortedPlayers;
    const q = normalize(search);
    return sortedPlayers.filter(p => normalize(p.nom).includes(q));
  }, [sortedPlayers, search]);

  function toggle(id) {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleSave() {
    if (!name.trim() || selectedIds.size === 0) return;
    onSave(name, Array.from(selectedIds));
  }

  const canSave = name.trim().length > 0 && selectedIds.size > 0;
  const title = isEdit ? 'Modifier le groupe' : 'Créer un groupe';

  return (
    <div className="group-modal-overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="group-modal create-group-modal" role="dialog" aria-modal="true" aria-label={title}>
        <div className="group-modal-header">
          <h3>{title}</h3>
          <button type="button" className="group-modal-close" onClick={onClose} aria-label="Fermer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <label className="group-modal-name">
          <span>Nom du groupe</span>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="ex : Titulaires, À surveiller…"
            autoFocus
          />
        </label>

        <div className="group-modal-players-header">
          <span>Joueurs ({selectedIds.size} sélectionné{selectedIds.size > 1 ? 's' : ''})</span>
          <input
            type="search"
            className="group-modal-search"
            placeholder="Rechercher…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>

        <div className="group-modal-players">
          {visiblePlayers.length === 0 && (
            <p className="group-modal-empty">Aucun joueur ne correspond à cette recherche.</p>
          )}
          {visiblePlayers.map(player => {
            const checked = selectedIds.has(player.id);
            return (
              <label key={player.id} className={`group-modal-player ${checked ? 'group-modal-player-checked' : ''}`}>
                <input type="checkbox" checked={checked} onChange={() => toggle(player.id)} />
                <span className="group-modal-player-identity">
                  <span className="group-modal-player-name">{player.nom}</span>
                  <AttributesInfo player={player} />
                </span>
              </label>
            );
          })}
        </div>

        <div className="group-modal-actions">
          <button type="button" className="group-modal-secondary" onClick={onClose}>
            Annuler
          </button>
          <button
            type="button"
            className="group-modal-confirm"
            onClick={handleSave}
            disabled={!canSave}
          >
            {isEdit ? 'Enregistrer' : 'Créer le groupe'}
          </button>
        </div>
      </div>
    </div>
  );
}
