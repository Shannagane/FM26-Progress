import { useEffect, useMemo, useState } from 'react';
import { normalize } from '../../utils/text.js';
import { positionRank } from '../../data/positionOrder.js';
import { MAX_PLAYERS_PER_SLOT } from '../../utils/depthAssignments.js';
import AttributesInfo from '../Squad/AttributesInfo.jsx';
import '../Squad/CreateGroupModal.css';
import './DepthSlotModal.css';

const SORT_OPTIONS = [
  { key: 'nom', label: 'Nom' },
  { key: 'age', label: 'Âge' },
  { key: 'poste', label: 'Meilleur poste' }
];

function sortPlayers(players, sortBy) {
  const sorted = [...players];
  if (sortBy === 'age') {
    sorted.sort((a, b) => (Number(a.age) || 0) - (Number(b.age) || 0));
  } else if (sortBy === 'poste') {
    sorted.sort((a, b) => positionRank(a.poste) - positionRank(b.poste));
  } else {
    sorted.sort((a, b) => (a.nom || '').localeCompare(b.nom || '', 'fr'));
  }
  return sorted;
}

// Liste ordonnée des joueurs placés sur ce poste (le premier est le titulaire) : boutons
// haut/bas pour changer le rang, croix pour retirer — pas de glisser-déposer, plus simple à
// utiliser au clic ou au tactile.
function RankedPlayersList({ players, onReorder, onRemove }) {
  if (players.length === 0) {
    return <p className="depth-slot-active-empty">Aucun joueur placé sur ce poste pour l'instant.</p>;
  }

  return (
    <div className="depth-slot-active-list">
      {players.map((player, index) => (
        <div className="depth-slot-active-item" key={player.id}>
          <span className="depth-slot-rank">{index + 1}</span>
          <span className="depth-slot-active-identity">
            <span className="depth-slot-active-name">{player.nom}</span>
            <AttributesInfo player={player} />
          </span>
          <span className="depth-slot-player-meta">
            <span className="depth-slot-player-poste">{player.poste || '–'}</span>
            <span className="depth-slot-player-age">{player.age ? `${player.age} ans` : '–'}</span>
          </span>
          <div className="depth-slot-active-controls">
            <button
              type="button"
              disabled={index === 0}
              onClick={() => onReorder(index, index - 1)}
              aria-label={`Monter ${player.nom}`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 14l6-6 6 6" /></svg>
            </button>
            <button
              type="button"
              disabled={index === players.length - 1}
              onClick={() => onReorder(index, index + 1)}
              aria-label={`Descendre ${player.nom}`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="M6 10l6 6 6-6" /></svg>
            </button>
            <button
              type="button"
              className="depth-slot-active-remove"
              onClick={() => onRemove(player.id)}
              aria-label={`Retirer ${player.nom}`}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// Modale ouverte en cliquant un poste sur le terrain de la page Profondeur d'effectif : choix
// manuel (aucun calcul automatique) de jusqu'à 8 joueurs pour ce poste précis, avec leur ordre
// (titulaire en premier, doublures ensuite). `players` n'a déjà que les joueurs éligibles à ce
// poste précis (le gardien à gauche filtre déjà GB / non-GB, voir DepthPage.jsx).
export default function DepthSlotModal({ slotLabel, players, selectedIds, onClose, onSave }) {
  const [orderedIds, setOrderedIds] = useState(selectedIds);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('nom');

  useEffect(() => {
    function onKeyDown(e) { if (e.key === 'Escape') onClose(); }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  const playerById = useMemo(() => new Map(players.map(p => [p.id, p])), [players]);
  const orderedPlayers = useMemo(
    () => orderedIds.map(id => playerById.get(id)).filter(Boolean),
    [orderedIds, playerById]
  );

  const sortedPlayers = useMemo(() => sortPlayers(players, sortBy), [players, sortBy]);

  const visiblePlayers = useMemo(() => {
    if (!search.trim()) return sortedPlayers;
    const q = normalize(search);
    return sortedPlayers.filter(p => normalize(p.nom).includes(q));
  }, [sortedPlayers, search]);

  const isFull = orderedIds.length >= MAX_PLAYERS_PER_SLOT;

  function toggle(id) {
    setOrderedIds(prev => {
      if (prev.includes(id)) return prev.filter(pid => pid !== id);
      if (prev.length >= MAX_PLAYERS_PER_SLOT) return prev;
      return [...prev, id];
    });
  }

  function remove(id) {
    setOrderedIds(prev => prev.filter(pid => pid !== id));
  }

  function reorder(fromIndex, toIndex) {
    setOrderedIds(prev => {
      if (toIndex < 0 || toIndex >= prev.length) return prev;
      const next = [...prev];
      const [moved] = next.splice(fromIndex, 1);
      next.splice(toIndex, 0, moved);
      return next;
    });
  }

  function handleSave() {
    onSave(orderedIds);
  }

  return (
    <div className="group-modal-overlay" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="group-modal depth-slot-modal" role="dialog" aria-modal="true" aria-label={`Joueurs — ${slotLabel}`}>
        <div className="group-modal-header">
          <h3>{slotLabel}</h3>
          <button type="button" className="group-modal-close" onClick={onClose} aria-label="Fermer">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
          </button>
        </div>

        <div className="depth-slot-columns">
          <div className="depth-slot-column">
            <div className="group-modal-players-header">
              <span>Ajouter un joueur</span>
              <select
                className="depth-slot-sort-select"
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                aria-label="Trier par"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.key} value={opt.key}>Trier par {opt.label}</option>
                ))}
              </select>
            </div>
            <input
              type="search"
              className="group-modal-search depth-slot-search"
              placeholder="Rechercher…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />

            <div className="group-modal-players depth-slot-column-list">
              {visiblePlayers.length === 0 && (
                <p className="group-modal-empty">Aucun joueur ne correspond à cette recherche.</p>
              )}
              {visiblePlayers.map(player => {
                const checked = orderedIds.includes(player.id);
                const disabled = !checked && isFull;
                return (
                  <label
                    key={player.id}
                    className={`group-modal-player ${checked ? 'group-modal-player-checked' : ''} ${disabled ? 'depth-slot-player-disabled' : ''}`}
                  >
                    <input type="checkbox" checked={checked} disabled={disabled} onChange={() => toggle(player.id)} />
                    <span className="group-modal-player-identity">
                      <span className="group-modal-player-name">{player.nom}</span>
                      <AttributesInfo player={player} />
                    </span>
                    <span className="depth-slot-player-meta">
                      <span className="depth-slot-player-poste">{player.poste || '–'}</span>
                      <span className="depth-slot-player-age">{player.age ? `${player.age} ans` : '–'}</span>
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="depth-slot-column">
            <div className="group-modal-players-header">
              <span>
                {orderedIds.length}/{MAX_PLAYERS_PER_SLOT} joueur{orderedIds.length > 1 ? 's' : ''} placé{orderedIds.length > 1 ? 's' : ''}
                {' · '}le premier est titulaire
              </span>
            </div>
            <div className="depth-slot-column-list">
              <RankedPlayersList players={orderedPlayers} onReorder={reorder} onRemove={remove} />
            </div>
          </div>
        </div>

        <div className="group-modal-actions">
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
