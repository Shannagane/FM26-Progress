import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAppData } from '../../context/AppContext.jsx';
import { comparePositions, primaryPosition } from '../../data/positionOrder.js';
import { normalize } from '../../utils/text.js';
import { loadGroups, addGroup, removeGroup } from '../../utils/groups.js';
import { COLUMN_BY_KEY } from '../../data/columnsConfig.js';
import { loadColumnKeys, saveColumnKeys } from '../../utils/columnPrefs.js';
import { isElectron, loadFacepackFolder, pickFacepackFolder, folderDisplayName } from '../../utils/facepack.js';
import { loadClubLogos } from '../../utils/clubLogos.js';
import SquadFilters from './SquadFilters.jsx';
import SquadTable from './SquadTable.jsx';
import CreateGroupModal from './CreateGroupModal.jsx';
import EditColumnsModal from './EditColumnsModal.jsx';
import ChoixClubModal from './ChoixClubModal.jsx';
import ChoixGroupeModal from './ChoixGroupeModal.jsx';
import './SquadPage.css';

const ALL_CLUBS = '__all__';

function clubInitials(name) {
  return (name || '').trim().split(/\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase() || '?';
}

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
    if (sortBy === 'position') {
      return comparePositions(primaryPosition(a.position), primaryPosition(b.position), direction);
    }
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
  const clubLogos = useMemo(() => loadClubLogos(), []);
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

  const [groups, setGroups] = useState(() => loadGroups());
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [columnKeys, setColumnKeys] = useState(() => loadColumnKeys());
  const [columnsModalOpen, setColumnsModalOpen] = useState(false);
  const [clubModalOpen, setClubModalOpen] = useState(false);
  const [groupFilterModalOpen, setGroupFilterModalOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);
  const [facepackFolder, setFacepackFolder] = useState(() => loadFacepackFolder());

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

  function handleCreateGroup(name, playerIds) {
    setGroups(prev => addGroup(prev, name, playerIds, selectedClub === ALL_CLUBS ? null : selectedClub));
    setGroupModalOpen(false);
  }

  function handleDeleteGroup(groupId, groupName) {
    if (!confirm(`Supprimer le groupe « ${groupName} » ? Cette action est irréversible.`)) return;
    setGroups(prev => removeGroup(prev, groupId));
  }

  // Les photos déjà affichées à l'écran ne re-testent pas spontanément une nouvelle source
  // après un changement de dossier : on recharge la page pour repartir d'un état propre.
  async function handleImportFacepack() {
    const folder = await pickFacepackFolder();
    if (!folder) return;
    setFacepackFolder(folder);
    window.location.reload();
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

  // Le groupe filtré n'a de sens que pour le club sur lequel il a été choisi (ou s'il a été
  // supprimé entretemps) : on revient sur "Tous les joueurs" dès qu'il n'est plus valide.
  useEffect(() => {
    if (selectedGroupId && !clubGroups.some(g => g.id === selectedGroupId)) {
      setSelectedGroupId(null);
    }
  }, [clubGroups, selectedGroupId]);

  // Par défaut, le tableau montre tout l'effectif du club ; en sélectionnant un groupe via la
  // modale "Groupe", il ne montre plus que les membres de ce groupe.
  const mainTablePlayers = useMemo(() => {
    if (!selectedGroupId) return visiblePlayers;
    const group = clubGroups.find(g => g.id === selectedGroupId);
    if (!group) return visiblePlayers;
    return visiblePlayers.filter(p => group.playerIds.includes(p.id));
  }, [visiblePlayers, clubGroups, selectedGroupId]);

  const squadSort = sortStates.all || DEFAULT_SORT;
  const sortedSquad = useMemo(
    () => sortPlayers(mainTablePlayers, squadSort.sortBy, squadSort.direction),
    [mainTablePlayers, squadSort]
  );

  const mainTableTitle = selectedGroupId
    ? (clubGroups.find(g => g.id === selectedGroupId)?.name || 'Effectif complet')
    : 'Effectif complet';

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
      <Link to="/effectif" className="squad-back-button">← Retour aux clubs</Link>

      <div className="squad-club-bar">
        <button type="button" className="squad-club-btn" onClick={() => setClubModalOpen(true)}>
          {selectedClub && selectedClub !== ALL_CLUBS ? (
            <>
              {clubLogos[selectedClub] ? (
                <img src={clubLogos[selectedClub]} alt="" className="squad-club-btn-logo" />
              ) : (
                <span className="squad-club-btn-logo squad-club-btn-logo-fallback">{clubInitials(selectedClub)}</span>
              )}
              <span className="squad-club-btn-label">{selectedClub}</span>
            </>
          ) : (
            <>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M12 3l7 3v5c0 5-3 8.5-7 10-4-1.5-7-5-7-10V6Z" strokeLinejoin="round" />
                <path d="M9 12l2 2 4-4.5" />
              </svg>
              Choix du club
            </>
          )}
        </button>

        {isElectron() && (
          <button type="button" className="squad-club-btn" onClick={handleImportFacepack}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <circle cx="9" cy="11" r="2" />
              <path d="M21 16.5 16 12l-9.5 7" strokeLinejoin="round" />
            </svg>
            <span className="squad-club-btn-label">
              {facepackFolder ? `Facepack : ${folderDisplayName(facepackFolder)}` : 'Importer facepack'}
            </span>
          </button>
        )}
      </div>

      <SquadFilters
        search={search}
        setSearch={setSearch}
        onCreateGroupClick={() => setGroupModalOpen(true)}
        onGroupFilterClick={() => setGroupFilterModalOpen(true)}
        onEditColumnsClick={() => setColumnsModalOpen(true)}
      />

      <div className="squad-category">
        <h2 className="squad-table-title">{mainTableTitle}</h2>
        <SquadTable
          players={sortedSquad}
          sortBy={squadSort.sortBy}
          direction={squadSort.direction}
          onSort={sortKey => handleSort('all', sortKey)}
          showClub={clubs.length > 1 && selectedClub === ALL_CLUBS}
          columns={activeColumns}
        />
      </div>

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

      {groupFilterModalOpen && (
        <ChoixGroupeModal
          groups={clubGroups}
          selectedGroupId={selectedGroupId}
          onApply={setSelectedGroupId}
          onDeleteGroup={handleDeleteGroup}
          onClose={() => setGroupFilterModalOpen(false)}
        />
      )}
    </div>
  );
}
