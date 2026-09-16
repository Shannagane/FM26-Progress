import React, { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAppData } from '../../context/AppContext.jsx';
import { comparePositions } from '../../data/positionOrder.js';
import { POSITION_CATEGORIES, getPositionCategory } from '../../data/positionCategories.js';
import { normalize } from '../../utils/text.js';
import { loadGroups, addGroup, removeGroup } from '../../utils/groups.js';
import SquadGroupsBar from './SquadGroupsBar.jsx';
import SquadFilters from './SquadFilters.jsx';
import SquadTable from './SquadTable.jsx';
import CreateGroupModal from './CreateGroupModal.jsx';
import './SquadPage.css';

const NUMERIC_SORT_KEYS = ['matchs_joues', 'buts', 'passes_decisives', 'note_moyenne'];
const ALL_CLUBS = '__all__';

// Les champs identité (dont "note moyenne") sont stockés en texte brut par le parseur CSV et
// utilisent parfois la virgule française comme séparateur décimal (ex : "7,45") : on la
// convertit en point avant conversion en nombre, sinon Number() renvoie NaN pour toutes les
// valeurs et le tri ne fait plus rien.
function parseNumericValue(raw) {
  if (raw === '' || raw === undefined || raw === null) return null;
  const num = Number(String(raw).trim().replace(',', '.'));
  return Number.isNaN(num) ? null : num;
}

// Comparateur numérique qui envoie toujours les valeurs manquantes en fin de liste,
// quel que soit le sens de tri choisi.
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
    // tri par nom
    const cmp = (a.nom || '').localeCompare(b.nom || '', 'fr');
    return direction === 'asc' ? cmp : -cmp;
  });
}

export default function SquadPage() {
  const { players } = useAppData();
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

  const [collapsed, setCollapsed] = useState({});
  const [selectedCategories, setSelectedCategories] = useState(() => new Set());
  const [groups, setGroups] = useState(() => loadGroups());
  const [groupModalOpen, setGroupModalOpen] = useState(false);

  function handleClubChange(newClub) {
    navigate(`/effectif/${encodeURIComponent(newClub)}`);
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
  // seulement ceux qui correspondent à la recherche en cours).
  const clubPlayers = useMemo(() => {
    if (clubs.length > 1 && selectedClub !== ALL_CLUBS) {
      return players.filter(p => (p.importClub || '').trim() === selectedClub);
    }
    return players;
  }, [players, clubs, selectedClub]);

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
      />

      <SquadFilters
        search={search}
        setSearch={setSearch}
        clubs={clubs}
        selectedClub={selectedClub}
        setSelectedClub={handleClubChange}
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
    </div>
  );
}
