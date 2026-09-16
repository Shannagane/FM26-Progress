import React, { useMemo, useState } from 'react';
import { useParams, Link, Navigate, useNavigate } from 'react-router-dom';
import { useAppData } from '../../context/AppContext.jsx';
import { comparePositions } from '../../data/positionOrder.js';
import { loadGroups, updateGroup, removeGroup } from '../../utils/groups.js';
import SquadTable from './SquadTable.jsx';
import CreateGroupModal from './CreateGroupModal.jsx';
import './GroupPage.css';

const NUMERIC_SORT_KEYS = ['matchs_joues', 'buts', 'passes_decisives', 'note_moyenne'];

function parseNumericValue(raw) {
  if (raw === '' || raw === undefined || raw === null) return null;
  const num = Number(String(raw).trim().replace(',', '.'));
  return Number.isNaN(num) ? null : num;
}

function compareNumeric(a, b, key, direction) {
  const va = parseNumericValue(a[key]);
  const vb = parseNumericValue(b[key]);
  const aValid = va !== null;
  const bValid = vb !== null;

  if (!aValid && !bValid) return 0;
  if (!aValid) return 1;
  if (!bValid) return -1;

  const diff = va - vb;
  return direction === 'asc' ? diff : -diff;
}

const DEFAULT_SORT = { sortBy: 'poste', direction: 'asc' };

function sortPlayers(players, sortBy, direction) {
  return [...players].sort((a, b) => {
    if (sortBy === 'poste') return comparePositions(a.poste, b.poste, direction);
    if (sortBy === 'age') {
      const diff = (Number(a.age) || 0) - (Number(b.age) || 0);
      return direction === 'asc' ? diff : -diff;
    }
    if (sortBy === 'club') {
      const cmp = (a.importClub || '').localeCompare(b.importClub || '', 'fr');
      return direction === 'asc' ? cmp : -cmp;
    }
    if (NUMERIC_SORT_KEYS.includes(sortBy)) {
      return compareNumeric(a, b, sortBy, direction);
    }
    const cmp = (a.nom || '').localeCompare(b.nom || '', 'fr');
    return direction === 'asc' ? cmp : -cmp;
  });
}

// Page dédiée à un groupe personnalisé : n'affiche que les joueurs choisis par l'utilisateur
// à la création du groupe (voir CreateGroupModal.jsx / utils/groups.js), avec la possibilité
// de le renommer/modifier sa liste de joueurs ou de le supprimer.
export default function GroupPage() {
  const { groupId } = useParams();
  const { players } = useAppData();
  const navigate = useNavigate();
  const [sort, setSort] = useState(DEFAULT_SORT);
  const [groups, setGroups] = useState(() => loadGroups());
  const [editModalOpen, setEditModalOpen] = useState(false);

  const group = useMemo(() => groups.find(g => g.id === groupId), [groups, groupId]);

  const groupPlayers = useMemo(() => {
    if (!group) return [];
    return players.filter(p => group.playerIds.includes(p.id));
  }, [players, group]);

  // Joueurs proposés à la sélection dans la modale d'édition : ceux du club du groupe s'il
  // en a un, sinon tout l'effectif (même logique que la création depuis SquadPage.jsx).
  const editablePlayers = useMemo(() => {
    if (group?.club) {
      return players.filter(p => (p.importClub || '').trim() === group.club);
    }
    return players;
  }, [players, group]);

  const clubs = useMemo(() => {
    const set = new Set(groupPlayers.map(p => (p.importClub || '').trim()).filter(Boolean));
    return set;
  }, [groupPlayers]);

  if (!group) {
    return <Navigate to="/effectif" replace />;
  }

  function handleSort(sortKey) {
    setSort(prev => (
      prev.sortBy === sortKey
        ? { sortBy: sortKey, direction: prev.direction === 'asc' ? 'desc' : 'asc' }
        : { sortBy: sortKey, direction: 'asc' }
    ));
  }

  function handleSaveEdit(name, playerIds) {
    setGroups(prev => updateGroup(prev, group.id, name, playerIds));
    setEditModalOpen(false);
  }

  function handleDelete() {
    if (!confirm(`Supprimer le groupe « ${group.name} » ? Cette action est irréversible.`)) return;
    removeGroup(groups, group.id);
    navigate(backTo);
  }

  const sortedPlayers = sortPlayers(groupPlayers, sort.sortBy, sort.direction);
  const backTo = group.club ? `/effectif/${encodeURIComponent(group.club)}` : '/effectif';

  return (
    <div className="group-page">
      <Link to={backTo} className="back-link">← Retour à l'effectif</Link>

      <div className="group-page-header">
        <h2 className="group-page-title">{group.name}</h2>
        <span className="squad-category-count">{groupPlayers.length} joueur(s)</span>
        <div className="group-page-actions">
          <button type="button" className="group-page-action-btn" onClick={() => setEditModalOpen(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 20h4L18.5 9.5a2.1 2.1 0 0 0-3-3L5.5 16z" strokeLinejoin="round" />
              <path d="M14.5 8l1.5 1.5" />
            </svg>
            Éditer
          </button>
          <button type="button" className="group-page-action-btn group-page-action-danger" onClick={handleDelete}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m2 0-.8 12.2a2 2 0 0 1-2 1.8H8.8a2 2 0 0 1-2-1.8L6 7" />
            </svg>
            Supprimer
          </button>
        </div>
      </div>

      {groupPlayers.length === 0 ? (
        <p className="group-page-empty">
          Aucun joueur de ce groupe n'est présent dans l'effectif importé.
        </p>
      ) : (
        <SquadTable
          players={sortedPlayers}
          sortBy={sort.sortBy}
          direction={sort.direction}
          onSort={handleSort}
          showClub={clubs.size > 1}
        />
      )}

      {editModalOpen && (
        <CreateGroupModal
          players={editablePlayers}
          group={group}
          onClose={() => setEditModalOpen(false)}
          onSave={handleSaveEdit}
        />
      )}
    </div>
  );
}
