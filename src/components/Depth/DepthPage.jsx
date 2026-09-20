import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppData } from '../../context/AppContext.jsx';
import { FORMATIONS, EXACT_POSITION_LABELS } from '../../data/formations.js';
import { isGoalkeeper } from '../../data/positionOrder.js';
import { loadFormationAssignments, saveSlotAssignment, MAX_PLAYERS_PER_SLOT } from '../../utils/depthAssignments.js';
import { loadClubFormation, saveClubFormation } from '../../utils/depthFormationPrefs.js';
import { loadLastDepthView, saveLastDepthView } from '../../utils/depthViewPrefs.js';
import { loadClubLogos } from '../../utils/clubLogos.js';
import AttributesInfo from '../Squad/AttributesInfo.jsx';
import PlayerAvatar from '../Squad/PlayerAvatar.jsx';
import DepthPitch from './DepthPitch.jsx';
import DepthFormationModal from './DepthFormationModal.jsx';
import DepthClubModal from './DepthClubModal.jsx';
import DepthSlotModal from './DepthSlotModal.jsx';
import './DepthPage.css';

const STATUS_LEGEND = [
  { tier: 'green', label: 'Excellent' },
  { tier: 'violet', label: 'Bon' },
  { tier: 'orange', label: 'Faible' },
  { tier: 'red', label: 'Critique' }
];

// Statut de profondeur d'un poste : purement basé sur le nombre de joueurs qu'on y a
// placés soi-même (aucun calcul automatique) — un poste sans doublure (0 ou 1 joueur) est
// toujours à surveiller, au-delà plus il y a de joueurs placés, plus la rotation est solide.
function depthStatusFromCount(count) {
  if (count >= 3) return { tier: 'green', label: 'Excellent' };
  if (count === 2) return { tier: 'violet', label: 'Bon' };
  if (count === 1) return { tier: 'orange', label: 'Faible' };
  return { tier: 'red', label: 'Critique' };
}

function formatDate(iso) {
  try {
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  } catch {
    return iso;
  }
}

function clubInitials(name) {
  return (name || '').trim().split(/\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase() || '?';
}

function insightSentence(status, code) {
  const label = EXACT_POSITION_LABELS[code].toLowerCase();
  switch (status.tier) {
    case 'green': return `Poste bien couvert : plusieurs options disponibles à ${label}.`;
    case 'violet': return `Rotation viable à ${label}, sans profondeur excédentaire.`;
    case 'orange': return `Doublure fragile à ${label} : pense à placer un joueur de plus.`;
    default: return `Aucun joueur placé à ${label} : clique le poste pour en ajouter.`;
  }
}

function EditIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

// `key={slot.id}` côté appelant réinitialise ce composant (donc la prévisualisation) à
// chaque changement de poste sélectionné sur le terrain.
function DepthDetailPanel({ slot, onEdit }) {
  const label = EXACT_POSITION_LABELS[slot.code];
  const [previewId, setPreviewId] = useState(slot.main?.player?.id || null);
  // Le joueur affiché en haut du panneau : celui qu'on vient de cliquer dans la liste
  // "Profondeur" ci-dessous, ou le titulaire par défaut.
  const previewed = slot.ranked.find(e => e.player.id === previewId)?.player || slot.main?.player || null;

  return (
    <div className="depth-panel-content">
      <div className="depth-panel-header">
        {previewed ? (
          <>
            <PlayerAvatar nom={previewed.nom} photo={previewed.photo} numero={previewed.numero} poste={previewed.poste} size={48} />
            <div className="depth-panel-heading">
              <div className="depth-panel-name-row">
                <span className="depth-panel-name">{previewed.nom}</span>
                <AttributesInfo player={previewed} />
              </div>
              <div className="depth-panel-meta">{previewed.age || '–'} ans • {label}</div>
            </div>
          </>
        ) : (
          <div className="depth-panel-heading">
            <div className="depth-panel-name-row">
              <span className="depth-panel-name">Poste vide</span>
            </div>
            <div className="depth-panel-meta">{label}</div>
          </div>
        )}
        <button type="button" className="depth-panel-edit-btn" onClick={onEdit}>
          <EditIcon /> Modifier
        </button>
      </div>

      {previewed && (
        <div className="depth-panel-stats">
          <div>
            <span className="depth-panel-stat-label">Note moy.</span>
            <span className="depth-panel-stat-value">{previewed.note_moyenne || '–'}</span>
          </div>
          <div>
            <span className="depth-panel-stat-label">Matchs joués</span>
            <span className="depth-panel-stat-value">{previewed.matchs_joues || '0'}</span>
          </div>
          <div>
            <span className="depth-panel-stat-label">Temps de jeu</span>
            <span className="depth-panel-stat-value">{previewed.temps_de_jeu || '–'}</span>
          </div>
        </div>
      )}

      <p className={`depth-panel-insight depth-panel-insight-${slot.status.tier}`}>
        {insightSentence(slot.status, slot.code)}
      </p>

      <div className="depth-panel-pool">
        <div className="depth-panel-pool-title">
          Profondeur — {label} ({slot.ranked.length}/{MAX_PLAYERS_PER_SLOT})
        </div>
        {slot.ranked.length === 0 ? (
          <p className="depth-panel-pool-empty">Aucun joueur placé pour ce poste.</p>
        ) : (
          <ol className="depth-panel-pool-list">
            {slot.ranked.map((entry, i) => (
              <li key={entry.player.id}>
                <button
                  type="button"
                  className={`depth-panel-pool-row ${entry.player.id === previewed?.id ? 'depth-panel-pool-row-active' : ''}`}
                  onClick={() => setPreviewId(entry.player.id)}
                >
                  <span className="depth-panel-pool-rank">{i + 1}-</span>
                  <span className="depth-panel-pool-name">{entry.player.nom}</span>
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>
    </div>
  );
}

export default function DepthPage() {
  const { snapshots } = useAppData();
  const clubLogos = useMemo(() => loadClubLogos(), []);

  const clubs = useMemo(() => {
    const set = new Set(snapshots.map(s => (s.csvName || '').trim()).filter(Boolean));
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'fr'));
  }, [snapshots]);

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

  // Reprend le club et l'import consultés en dernier (voir depthViewPrefs.js) s'ils existent
  // toujours dans les imports disponibles, sinon retombe sur le premier club par défaut.
  const lastView = useMemo(() => loadLastDepthView(), []);
  const [selectedClub, setSelectedClub] = useState(() => {
    if (lastView?.club && clubs.includes(lastView.club)) return lastView.club;
    return clubs[0] || null;
  });
  const [selectedSnapshotId, setSelectedSnapshotId] = useState(() => {
    const club = (lastView?.club && clubs.includes(lastView.club)) ? lastView.club : clubs[0];
    const imports = club && importsByClub.get(club);
    if (lastView?.snapshotId && imports?.some(s => s.id === lastView.snapshotId)) return lastView.snapshotId;
    return imports?.[0]?.id || null;
  });
  // La formation choisie est mémorisée par club (voir applyFormationModal), et rechargée
  // dès qu'on revient sur la page ou qu'on change de club — plus besoin de la resélectionner.
  const [formationKey, setFormationKey] = useState(() => loadClubFormation(selectedClub, FORMATIONS[0].key));
  const [locked, setLocked] = useState(null);
  const [editingSlotId, setEditingSlotId] = useState(null);

  const [formationModalOpen, setFormationModalOpen] = useState(false);
  const [clubModalOpen, setClubModalOpen] = useState(false);

  const formation = FORMATIONS.find(f => f.key === formationKey) || FORMATIONS[0];
  // Tant qu'aucune formation n'a jamais été choisie pour ce club, le bouton affiche le libellé
  // générique "Formation" plutôt que le schéma par défaut (le terrain, lui, l'utilise déjà).
  const hasChosenFormation = useMemo(
    () => loadClubFormation(selectedClub, null) !== null,
    [selectedClub, formationKey]
  );

  const selectedSnapshot = useMemo(
    () => snapshots.find(s => s.id === selectedSnapshotId) || null,
    [snapshots, selectedSnapshotId]
  );

  const scopedPlayers = useMemo(
    () => (selectedSnapshot ? Object.values(selectedSnapshot.players) : []),
    [selectedSnapshot]
  );

  const scopedPlayersById = useMemo(
    () => new Map(scopedPlayers.map(p => [p.id, p])),
    [scopedPlayers]
  );

  useEffect(() => {
    setFormationKey(loadClubFormation(selectedClub, FORMATIONS[0].key));
  }, [selectedClub]);

  useEffect(() => {
    if (selectedClub) saveLastDepthView(selectedClub, selectedSnapshotId);
  }, [selectedClub, selectedSnapshotId]);

  // Affectations manuelles (postes -> jusqu'à 8 joueurs) : propres au club, à l'import précis
  // et à la formation consultés, rechargées dès que l'un des trois change.
  const [assignments, setAssignments] = useState(() => loadFormationAssignments(selectedClub, selectedSnapshotId, formationKey));
  useEffect(() => {
    setAssignments(loadFormationAssignments(selectedClub, selectedSnapshotId, formationKey));
    setLocked(null);
  }, [selectedClub, selectedSnapshotId, formationKey]);

  const slots = useMemo(() => formation.slots.map((slot, index) => {
    const id = `${slot.code}-${index}`;
    const players = (assignments[id] || [])
      .map(pid => scopedPlayersById.get(pid))
      .filter(Boolean)
      .map(player => ({ player }));
    return {
      id,
      code: slot.code,
      x: slot.x,
      y: slot.y,
      main: players[0] || null,
      bench: players.slice(1, 3),
      ranked: players,
      status: depthStatusFromCount(players.length)
    };
  }), [formation, assignments, scopedPlayersById]);

  const lockedSlot = locked ? slots.find(s => s.id === locked) : null;
  const editingSlot = editingSlotId ? slots.find(s => s.id === editingSlotId) : null;

  // Le poste de gardien (GB, en bas du terrain) ne peut accueillir que des gardiens ; tous
  // les autres postes excluent les gardiens — la modale de choix ne propose donc que les
  // joueurs éligibles à CE poste précis.
  const eligiblePlayersForSlot = useMemo(() => {
    if (!editingSlot) return [];
    const wantsGoalkeeper = editingSlot.code === 'GB';
    return scopedPlayers.filter(p => isGoalkeeper(p.poste) === wantsGoalkeeper);
  }, [editingSlot, scopedPlayers]);

  // Un poste déjà occupé se contente d'afficher ses infos dans le panneau ; la modale de
  // choix ne s'ouvre automatiquement que pour un poste encore vide (sinon, le bouton
  // "Modifier" du panneau permet de la rouvrir).
  function handleSelectSlot(slot) {
    setLocked(slot.id);
    if (slot.ranked.length === 0) {
      setEditingSlotId(slot.id);
    }
  }

  function handleSaveSlotPlayers(playerIds) {
    if (!editingSlotId) return;
    saveSlotAssignment(selectedClub, selectedSnapshotId, formationKey, editingSlotId, playerIds);
    setAssignments(prev => ({ ...prev, [editingSlotId]: playerIds }));
    setEditingSlotId(null);
  }

  // Les modales Formation/Club gardent leur propre choix en brouillon (résumé live inclus) et
  // n'appellent ceci qu'au clic sur "Appliquer" — rien n'est donc écrit en mémoire tant que
  // l'utilisateur n'a pas confirmé, contrairement à avant où chaque aperçu était déjà persisté.
  function applyFormationModal(key) {
    setFormationKey(key);
    saveClubFormation(selectedClub, key);
    setLocked(null);
  }

  function applyClubModal(club, snapshotId) {
    setSelectedClub(club);
    setSelectedSnapshotId(snapshotId);
    setLocked(null);
  }

  function openFormationModal() {
    setFormationModalOpen(true);
  }
  function closeFormationModal() {
    setFormationModalOpen(false);
  }

  function openClubModal() {
    setClubModalOpen(true);
  }
  function closeClubModal() {
    setClubModalOpen(false);
  }

  if (snapshots.length === 0) {
    return (
      <div className="depth-page">
        <div className="depth-empty-state">
          Aucun joueur importé pour le moment. Rends-toi sur le{' '}
          <Link to="/">tableau de bord</Link> pour charger ton export CSV.
        </div>
      </div>
    );
  }

  return (
    <div className="depth-page">

      <div className="depth-controls">
        <div className="depth-club-info">
          {selectedClub && clubLogos[selectedClub] ? (
            <img src={clubLogos[selectedClub]} alt="" className="depth-club-info-logo" />
          ) : (
            <span className="depth-club-info-logo depth-club-info-logo-fallback">{clubInitials(selectedClub)}</span>
          )}
          <div className="depth-club-info-text">
            <div className="depth-club-info-name">{selectedClub || 'Aucun club'}</div>
            {selectedSnapshot && (
              <div className="depth-club-info-meta">
                {formatDate(selectedSnapshot.gameDate)} · {scopedPlayers.length} joueur{scopedPlayers.length > 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>

        <div className="depth-controls-actions">
          <button type="button" className="depth-config-btn" onClick={openFormationModal}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
              <path d="M3.5 10.5h17M9 4.5v15" />
            </svg>
            <span className="depth-config-btn-label">{hasChosenFormation ? formation.label : 'Formation'}</span>
          </button>

          <button type="button" className="depth-config-btn" onClick={openClubModal}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M4 21V6.5a2 2 0 0 1 1.2-1.83l6-2.57a2 2 0 0 1 1.6 0l6 2.57A2 2 0 0 1 20 6.5V21" />
              <path d="M9 21v-5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v5M9 10h.01M15 10h.01M12 10h.01" />
            </svg>
            <span className="depth-config-btn-label">{selectedClub || 'Club'}</span>
          </button>
        </div>
      </div>

      <div className="depth-layout">
        <DepthPitch
          formation={formation}
          slots={slots}
          lockedSlotId={locked}
          onSelectSlot={handleSelectSlot}
          onClear={() => setLocked(null)}
        />

        <div className="depth-panel">
          {!lockedSlot ? (
            <div className="depth-panel-placeholder">
              Clique un poste sur le terrain pour choisir ses joueurs et voir le détail.
            </div>
          ) : (
            <DepthDetailPanel key={lockedSlot.id} slot={lockedSlot} onEdit={() => setEditingSlotId(lockedSlot.id)} />
          )}
        </div>
      </div>

      <div className="depth-legend">
        <span className="depth-legend-label">Statut de la profondeur d'effectif :</span>
        {STATUS_LEGEND.map(item => (
          <div className="depth-legend-item" key={item.tier}>
            <span className={`depth-legend-dot depth-legend-dot-${item.tier}`} />
            <span>{item.label}</span>
          </div>
        ))}
      </div>

      {formationModalOpen && (
        <DepthFormationModal
          formationKey={formationKey}
          club={selectedClub}
          onApply={applyFormationModal}
          onClose={closeFormationModal}
        />
      )}

      {clubModalOpen && (
        <DepthClubModal
          clubs={clubs}
          importsByClub={importsByClub}
          selectedClub={selectedClub}
          selectedSnapshotId={selectedSnapshotId}
          formationLabel={formation.label}
          onApply={applyClubModal}
          onClose={closeClubModal}
        />
      )}

      {editingSlot && (
        <DepthSlotModal
          slotLabel={EXACT_POSITION_LABELS[editingSlot.code]}
          players={eligiblePlayersForSlot}
          selectedIds={editingSlot.ranked.map(e => e.player.id)}
          onClose={() => setEditingSlotId(null)}
          onSave={handleSaveSlotPlayers}
        />
      )}
    </div>
  );
}
