import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppData } from '../../context/AppContext.jsx';
import { comparePositions } from '../../data/positionOrder.js';
import { POSITION_CATEGORIES, getPositionCategory } from '../../data/positionCategories.js';
import { normalize } from '../../utils/text.js';
import SquadFilters from './SquadFilters.jsx';
import SquadTable from './SquadTable.jsx';
import './SquadPage.css';

const NUMERIC_SORT_KEYS = ['matchs_joues', 'buts', 'passes_decisives', 'note_moyenne'];
const ALL_CLUBS = '__all__';

// Comparateur numérique qui envoie toujours les valeurs manquantes en fin de liste,
// quel que soit le sens de tri choisi.
function compareNumeric(a, b, key, direction) {
  const va = a[key] === '' || a[key] === undefined || a[key] === null ? null : Number(a[key]);
  const vb = b[key] === '' || b[key] === undefined || b[key] === null ? null : Number(b[key]);
  const aValid = va !== null && !Number.isNaN(va);
  const bValid = vb !== null && !Number.isNaN(vb);

  if (!aValid && !bValid) return 0;
  if (!aValid) return 1;
  if (!bValid) return -1;

  const diff = va - vb;
  return direction === 'asc' ? diff : -diff;
}

// Club le plus représenté dans l'effectif importé : sert de sélection par défaut
// quand plusieurs clubs ont été importés (ex : changement de club en cours de carrière).
function findDefaultClub(players) {
  const counts = new Map();
  players.forEach(p => {
    const club = (p.importClub || '').trim();
    if (!club) return;
    counts.set(club, (counts.get(club) || 0) + 1);
  });
  let best = null;
  let bestCount = 0;
  counts.forEach((count, club) => {
    if (count > bestCount) { best = club; bestCount = count; }
  });
  return best || ALL_CLUBS;
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
  // Tri indépendant par catégorie de poste : { [catKey]: { sortBy, direction } }
  const [sortStates, setSortStates] = useState({});
  const [search, setSearch] = useState('');

  const clubs = useMemo(() => {
    const set = new Set(players.map(p => (p.importClub || '').trim()).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'fr'));
  }, [players]);

  const [selectedClub, setSelectedClub] = useState(() => findDefaultClub(players));
  const [collapsed, setCollapsed] = useState({});

  function toggleCategory(key) {
    setCollapsed(prev => ({ ...prev, [key]: !prev[key] }));
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

  const visiblePlayers = useMemo(() => {
    let list = players;

    if (clubs.length > 1 && selectedClub !== ALL_CLUBS) {
      list = list.filter(p => (p.importClub || '').trim() === selectedClub);
    }

    if (search.trim()) {
      const q = normalize(search);
      list = list.filter(p => normalize(p.nom).includes(q));
    }

    return list;
  }, [players, clubs, selectedClub, search]);

  const groupedByPosition = useMemo(() => {
    const groups = new Map(POSITION_CATEGORIES.map(cat => [cat.key, []]));
    visiblePlayers.forEach(p => {
      const cat = getPositionCategory(p.poste);
      groups.get(cat.key).push(p);
    });
    return POSITION_CATEGORIES
      .map(cat => ({ ...cat, players: groups.get(cat.key) }))
      .filter(cat => cat.players.length > 0);
  }, [visiblePlayers]);

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
      <SquadFilters
        search={search}
        setSearch={setSearch}
        clubs={clubs}
        selectedClub={selectedClub}
        setSelectedClub={setSelectedClub}
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
    </div>
  );
}
