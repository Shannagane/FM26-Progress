import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAppData } from '../../context/AppContext.jsx';
import { comparePositions } from '../../data/positionOrder.js';
import { POSITION_CATEGORIES, getPositionCategory } from '../../data/positionCategories.js';
import { normalize } from '../../utils/text.js';
import { loadGroups, addGroup, removeGroup } from '../../utils/groups.js';
import { COLUMN_BY_KEY } from '../../data/columnsConfig.js';
import { loadColumnKeys, saveColumnKeys } from '../../utils/columnPrefs.js';
import SquadGroupsBar from './SquadGroupsBar.jsx';
import SquadFilters from './SquadFilters.jsx';
import SquadTable from './SquadTable.jsx';
import CreateGroupModal from './CreateGroupModal.jsx';
import EditColumnsModal from './EditColumnsModal.jsx';
import ChoixClubModal from './ChoixClubModal.jsx';
import './SquadPage.css';

const ALL_CLUBS = '__all__';

// Comparateur numérique qui envoie toujours les valeurs manquantes en fin de liste,
// quel que soit le sens de tri choisi.
function compareNumeric(a, b, column, direction) {
  const va = column.getSortValue(a);
  const vb = column.getSortValue(b);
  const aValid = va !== null && va !== undefined && !Number.isNaN(va);
  const bValid = vb !== null && vb !== undefined && !Number.isNaN(vb);

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
    if (sortBy === 'club') {
      const cmp = (a.importClub || '').localeCompare(b.importClub || '', 'fr');
      return direction === 'asc' ? cmp : -cmp;
    }
    const column = sortBy !== 'nom' ? COLUMN_BY_KEY[sortBy] : null;
    if (column) {
      if (column.numeric) return compareNumeric(a, b, column, direction);
      const cmp = String(column.getSortValue(a) || '').localeCompare(String(column.getSortValue(b) || ''), 'fr');
      return direction === 'asc' ? cmp : -cmp;
    }
    // tri par nom (par défaut, ou colonne inconnue)
    const cmp = (a.nom || '').localeCompare(b.nom || '', 'fr');
    return direction === 'asc' ? cmp : -cmp;
  });
}

export default function SquadPage() {
  const { players, snapshots } = useAppData();
  const { club: clubParam } = useParams();
  const navigate = useNavigate();
  const selectedClub = decodeURIComponent(clubParam);
  // Tri indépendant par catégorie de poste : { [catKey]: { sortBy, direction } }
  const [sortStates, setSortStates] = useState({});
  const [search, setSearch] = useState('');

  const clubs = useMemo(() => {
    const set = new Set(players.map(p => (p.importClub || '').trim()).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'fr'));
  }, [players]);

  // Imports (snapshots) groupés par club, du plus récent au plus ancien — sert à choisir
  // l'import affiché depuis la modale "Choix du club" (voir ChoixClubModal.jsx).
  const importsByClub = useMemo(() => {
    const map = new Map();
    snapshots.forEach(snap => {
      const club = (snap.csvName || '').trim();
      if (!club) return;
      const list = map.get(club) || [];
      list.push(snap);
      map.set(club, list);
    });
    map.forEach(list => list.sort((a, b) => new Date(b.gameDate) - new Date(a.gameDate)));
    return map;
  }, [snapshots]);

  const [selectedSnapshotId, setSelectedSnapshotId] = useState(() => (
    importsByClub.get(selectedClub)?.[0]?.id || null
  ));

  // Revient sur le dernier import du club dès que l'import sélectionné n'appartient plus au
  // club affiché (changement de club hors modale, ex. URL modifiée à la main) : un import
  // précis n'a de sens que pour le club sur lequel il a été choisi. Ne redéclenche rien quand
  // la modale "Choix du club" vient déjà de fixer club + import ensemble via handleApplyClubModal.
  useEffect(() => {
    const stillValid = (importsByClub.get(selectedClub) || []).some(s => s.id === selectedSnapshotId);
    if (!stillValid) {
      setSelectedSnapshotId(importsByClub.get(selectedClub)?.[0]?.id || null);
    }
  }, [selectedClub, importsByClub, selectedSnapshotId]);

  const selectedSnapshot = useMemo(
    () => snapshots.find(s => s.id === selectedSnapshotId) || null,
    [snapshots, selectedSnapshotId]
  );

  const [collapsed, setCollapsed] = useState({});
  const [selectedCategories, setSelectedCategories] = useState(() => new Set());
  const [groups, setGroups] = useState(() => loadGroups());
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [columnKeys, setColumnKeys] = useState(() => loadColumnKeys());
  const [columnsModalOpen, setColumnsModalOpen] = useState(false);
  const [clubModalOpen, setClubModalOpen] = useState(false);

  const activeColumns = useMemo(
    () => columnKeys.map(key => COLUMN_BY_KEY[key]).filter(Boolean),
    [columnKeys]
  );

  function handleSaveColumns(keys) {
    setColumnKeys(keys);
    saveColumnKeys(keys);
    setColumnsModalOpen(false);
  }

  // Applique en une fois le club et l'import choisis dans la modale "Choix du club" : évite
  // que l'effet de reset ci-dessus (basé sur le club de la route) n'écrase l'import qu'on
  // vient tout juste de sélectionner pour ce nouveau club.
  function handleApplyClubModal(newClub, newSnapshotId) {
    if (newClub !== selectedClub) {
      navigate(`/effectif/${encodeURIComponent(newClub)}`);
    }
    setSelectedSnapshotId(newSnapshotId);
  }

  function toggleCategory(key) {
    setCollapsed(prev => ({ ...prev, [key]: !prev[key] }));
  }

  function handleCreateGroup(name, playerIds) {
    setGroups(prev => addGroup(prev, name, playerIds, selectedClub === ALL_CLUBS ? null : selectedClub));
    setGroupModalOpen(false);
  }

  function handleDeleteGroup(groupId, groupName) {
    if (!confirm(`Supprimer le groupe « ${groupName} » ? Cette action est irréversible.`)) return;
    setGroups(prev => removeGroup(prev, groupId));
  }

  function toggleCategoryFilter(key) {
    setSelectedCategories(prev => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function handleSort(catKey, sortKey) {
    setSortStates(prev => {
      const current = prev[catKey] || DEFAULT_SORT;
      const next = current.sortBy === sortKey
        ? { sortBy: sortKey, direction: current.direction === 'asc' ? 'desc' : 'asc' }
        : { sortBy: sortKey, direction: 'asc' };
      return { ...prev, [catKey]: next };
    });
  }

  // Joueurs du club affiché, sans le filtre de recherche (sert de base à la modale de
  // création de groupe : on doit pouvoir choisir n'importe quel joueur du club, pas
  // seulement ceux qui correspondent à la recherche en cours). Si un import précis a été
  // choisi via la modale "Choix du club", on affiche l'état de CET import plutôt que l'état
  // courant fusionné (dernière valeur connue de chaque joueur, tous imports confondus).
  const clubPlayers = useMemo(() => {
    if (selectedClub === ALL_CLUBS) return players;
    if (selectedSnapshot && (selectedSnapshot.csvName || '').trim() === selectedClub) {
      return Object.values(selectedSnapshot.players).map(p => ({ ...p, importClub: selectedClub }));
    }
    return players.filter(p => (p.importClub || '').trim() === selectedClub);
  }, [players, selectedClub, selectedSnapshot]);

  const visiblePlayers = useMemo(() => {
    let list = clubPlayers;

    if (search.trim()) {
      const q = normalize(search);
      list = list.filter(p => normalize(p.nom).includes(q));
    }

    return list;
  }, [clubPlayers, search]);

  // Groupes du club affiché (ou tous, en vue "Tous les clubs").
  const clubGroups = useMemo(() => (
    selectedClub === ALL_CLUBS ? groups : groups.filter(g => g.club === selectedClub)
  ), [groups, selectedClub]);

  const groupedByPosition = useMemo(() => {
    const groups = new Map(POSITION_CATEGORIES.map(cat => [cat.key, []]));
    visiblePlayers.forEach(p => {
      const cat = getPositionCategory(p.poste);
      groups.get(cat.key).push(p);
    });
    const categoriesToShow = selectedCategories.size > 0
      ? POSITION_CATEGORIES.filter(cat => selectedCategories.has(cat.key))
      : POSITION_CATEGORIES;
    return categoriesToShow
      .map(cat => ({ ...cat, players: groups.get(cat.key) }))
      .filter(cat => cat.players.length > 0);
  }, [visiblePlayers, selectedCategories]);

  // Groupes personnalisés du club affiché : même filtre recherche que le reste de la page,
  // croisé avec la liste de joueurs choisie par l'utilisateur à la création du groupe.
  const groupedCustom = useMemo(() => {
    return clubGroups
      .map(g => ({ ...g, players: visiblePlayers.filter(p => g.playerIds.includes(p.id)) }))
      .filter(g => g.players.length > 0);
  }, [clubGroups, visiblePlayers]);

  if (players.length === 0) {
    return (
      <div className="squad-page">
        <div className="squad-empty">
          Aucun joueur importé pour le moment. Rends-toi sur le{' '}
          <Link to="/">tableau de bord</Link> pour charger ton export CSV.
        </div>
      </div>
    );
  }

  return (
    <div className="squad-page">
      <Link to="/effectif" className="back-link">← Retour aux clubs</Link>

      <SquadGroupsBar
        groups={clubGroups}
        onCreateGroupClick={() => setGroupModalOpen(true)}
        onEditColumnsClick={() => setColumnsModalOpen(true)}
      />

      <div className="squad-club-bar">
        <button type="button" className="squad-club-btn" onClick={() => setClubModalOpen(true)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
            <path d="M12 3l7 3v5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V6Z" strokeLinejoin="round" />
            <path d="M9 12l2 2 4-4.5" />
          </svg>
          Choix du club
        </button>
      </div>

      <SquadFilters
        search={search}
        setSearch={setSearch}
        selectedCategories={selectedCategories}
        onToggleCategory={toggleCategoryFilter}
      />

      {groupedByPosition.map(cat => {
        const isOpen = !collapsed[cat.key];
        const catSort = sortStates[cat.key] || DEFAULT_SORT;
        const sortedPlayers = sortPlayers(cat.players, catSort.sortBy, catSort.direction);
        return (
          <div className="squad-category" key={cat.key}>
            <button
              type="button"
              className="squad-category-header"
              onClick={() => toggleCategory(cat.key)}
              aria-expanded={isOpen}
            >
              <svg
                className={`squad-category-chevron ${isOpen ? 'squad-category-chevron-open' : ''}`}
                viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
              >
                <path d="M9 6l6 6-6 6" />
              </svg>
              <h3 className="squad-category-title">{cat.label}</h3>
              <span className="squad-category-count">{cat.players.length} joueur(s)</span>
            </button>
            {isOpen && (
              <SquadTable
                players={sortedPlayers}
                sortBy={catSort.sortBy}
                direction={catSort.direction}
                onSort={sortKey => handleSort(cat.key, sortKey)}
                showClub={clubs.length > 1 && selectedClub === ALL_CLUBS}
                columns={activeColumns}
              />
            )}
          </div>
        );
      })}

      {groupedCustom.map(group => {
        const isOpen = !collapsed[group.id];
        const groupSort = sortStates[group.id] || DEFAULT_SORT;
        const sortedPlayers = sortPlayers(group.players, groupSort.sortBy, groupSort.direction);
        return (
          <div className="squad-category squad-custom-group" key={group.id}>
            <div className="squad-category-header squad-custom-group-header">
              <button
                type="button"
                className="squad-custom-group-toggle"
                onClick={() => toggleCategory(group.id)}
                aria-expanded={isOpen}
              >
                <svg
                  className={`squad-category-chevron ${isOpen ? 'squad-category-chevron-open' : ''}`}
                  viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2"
                >
                  <path d="M9 6l6 6-6 6" />
                </svg>
                <h3 className="squad-category-title">{group.name}</h3>
                <span className="squad-category-count">{group.players.length} joueur(s)</span>
              </button>
              <button
                type="button"
                className="squad-custom-group-delete"
                onClick={() => handleDeleteGroup(group.id, group.name)}
                aria-label={`Supprimer le groupe ${group.name}`}
                title="Supprimer ce groupe"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M4 7h16M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2m2 0-.8 12.2a2 2 0 0 1-2 1.8H8.8a2 2 0 0 1-2-1.8L6 7" />
                </svg>
              </button>
            </div>
            {isOpen && (
              <SquadTable
                players={sortedPlayers}
                sortBy={groupSort.sortBy}
                direction={groupSort.direction}
                onSort={sortKey => handleSort(group.id, sortKey)}
                showClub={clubs.length > 1 && selectedClub === ALL_CLUBS}
                columns={activeColumns}
              />
            )}
          </div>
        );
      })}

      {groupModalOpen && (
        <CreateGroupModal
          players={clubPlayers}
          onClose={() => setGroupModalOpen(false)}
          onSave={handleCreateGroup}
        />
      )}

      {columnsModalOpen && (
        <EditColumnsModal
          selectedKeys={columnKeys}
          onClose={() => setColumnsModalOpen(false)}
          onSave={handleSaveColumns}
        />
      )}

      {clubModalOpen && (
        <ChoixClubModal
          clubs={clubs}
          players={players}
          snapshots={snapshots}
          selectedClub={selectedClub}
          selectedSnapshotId={selectedSnapshotId}
          onApply={handleApplyClubModal}
          onClose={() => setClubModalOpen(false)}
        />
      )}
    </div>
  );
}
