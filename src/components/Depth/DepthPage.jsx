import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppData } from '../../context/AppContext.jsx';
import { FORMATIONS, EXACT_POSITION_LABELS, EXACT_CODE_TO_GROUP } from '../../data/formations.js';
import { buildPitchDepth } from '../../utils/pitchDepth.js';
import { getMethodProfiles, scoreTier, NEWGENS_METHODS } from '../../data/newgensPositionProfiles.js';
import { ATTR_BY_KEY, attributeColorClass } from '../../data/attributesConfig.js';
import { formatTransferValue } from '../../utils/transferValue.js';
import AttributesInfo from '../Squad/AttributesInfo.jsx';
import DepthPitch from './DepthPitch.jsx';
import DepthFormationModal from './DepthFormationModal.jsx';
import DepthClubModal from './DepthClubModal.jsx';
import DepthMethodModal from './DepthMethodModal.jsx';
import './DepthPage.css';

const STATUS_LEGEND = [
  { tier: 'green', label: 'Excellent' },
  { tier: 'violet', label: 'Bon' },
  { tier: 'orange', label: 'Faible' },
  { tier: 'red', label: 'Critique' }
];

function insightSentence(status, code) {
  const label = EXACT_POSITION_LABELS[code].toLowerCase();
  switch (status.tier) {
    case 'green': return `Poste bien couvert : plusieurs options fiables à ${label}.`;
    case 'violet': return `Rotation viable à ${label}, sans profondeur excédentaire.`;
    case 'orange': return `Doublure fragile à ${label} : poste à surveiller.`;
    default: return `Aucune solution fiable à ${label} : renfort recommandé.`;
  }
}

function initials(nom) {
  return (nom || '').trim().split(/\s+/).slice(0, 2).map(p => p[0]).join('').toUpperCase() || '?';
}

function DepthDetailPanel({ slot, entry, profileByKey, method, onSelectEntry }) {
  if (!entry) {
    return (
      <div className="depth-panel-empty">
        <div className="depth-panel-empty-title">Poste vide — {EXACT_POSITION_LABELS[slot.code]}</div>
        <p>Aucun joueur de l'effectif ne couvre ce poste actuellement.</p>
      </div>
    );
  }

  const { player, percent, scoreLabel } = entry;
  const groupKey = EXACT_CODE_TO_GROUP[method]?.[slot.code];
  const profile = groupKey ? profileByKey[groupKey] : null;
  const topAttrs = profile
    ? Object.entries(profile.weights || profile.coefficients).sort((a, b) => b[1] - a[1]).slice(0, 4)
    : [];
  const tier = scoreTier(percent, 100);

  return (
    <div className="depth-panel-content">
      <div className="depth-panel-header">
        <span className={`depth-panel-avatar depth-bg-${tier}`}>{initials(player.nom)}</span>
        <div className="depth-panel-heading">
          <div className="depth-panel-name-row">
            <span className="depth-panel-name">{player.nom}</span>
            <AttributesInfo player={player} />
          </div>
          <div className="depth-panel-meta">
            {slot.code} • {EXACT_POSITION_LABELS[slot.code]} • {player.age || '–'} ans
          </div>
        </div>
        <span className={`depth-panel-score depth-text-${tier}`}>{scoreLabel}</span>
      </div>

      <div className="depth-panel-stats">
        <div>
          <span className="depth-panel-stat-label">Valeur</span>
          <span className="depth-panel-stat-value">{player.valeur_transfert ? formatTransferValue(player.valeur_transfert) : '–'}</span>
        </div>
        <div>
          <span className="depth-panel-stat-label">Note moy.</span>
          <span className="depth-panel-stat-value">{player.note_moyenne || '–'}</span>
        </div>
        <div>
          <span className="depth-panel-stat-label">Matchs</span>
          <span className="depth-panel-stat-value">{player.matchs_joues || '0'}</span>
        </div>
      </div>

      {topAttrs.length > 0 && (
        <div className="depth-panel-attrs">
          <div className="depth-panel-attrs-title">Attributs clés du poste</div>
          {topAttrs.map(([key]) => {
            const def = ATTR_BY_KEY[key];
            if (!def) return null;
            const value = player.attributes?.[key];
            return (
              <div className="depth-panel-attr-row" key={key}>
                <span className="depth-panel-attr-label">{def.label}</span>
                <span className={`depth-panel-attr-value ${attributeColorClass(value)}`}>{value ?? '–'}</span>
              </div>
            );
          })}
        </div>
      )}

      <p className={`depth-panel-insight depth-panel-insight-${slot.status.tier}`}>
        {insightSentence(slot.status, slot.code)}
      </p>

      <div className="depth-panel-pool">
        <div className="depth-panel-pool-title">
          Profondeur — {EXACT_POSITION_LABELS[slot.code]} ({slot.ranked.length})
        </div>
        {slot.ranked.length === 0 ? (
          <p className="depth-panel-pool-empty">Aucun joueur disponible pour ce poste.</p>
        ) : (
          <ul className="depth-panel-pool-list">
            {slot.ranked.map((e, i) => (
              <li key={e.player.id}>
                <button
                  type="button"
                  className={`depth-panel-pool-row ${e.player.id === entry.player.id ? 'depth-panel-pool-row-active' : ''}`}
                  onClick={() => onSelectEntry(e)}
                >
                  <span className="depth-panel-pool-rank">{i + 1}</span>
                  <span className="depth-panel-pool-name">{e.player.nom}</span>
                  <span className={`depth-panel-pool-score depth-text-${scoreTier(e.percent, 100)}`}>{e.scoreLabel}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Link to={`/joueur/${player.id}`} className="depth-panel-link">Voir la fiche complète →</Link>
    </div>
  );
}

export default function DepthPage() {
  const { snapshots } = useAppData();
  const [formationKey, setFormationKey] = useState(FORMATIONS[0].key);

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

  const [selectedClub, setSelectedClub] = useState(() => clubs[0] || null);
  const [selectedSnapshotId, setSelectedSnapshotId] = useState(() => {
    const first = clubs[0] && importsByClub.get(clubs[0]);
    return first?.[0]?.id || null;
  });
  const [method, setMethod] = useState('fm26');
  const [locked, setLocked] = useState(null);

  const [formationModalOpen, setFormationModalOpen] = useState(false);
  const [formationSnapshot, setFormationSnapshot] = useState(null);
  const [clubModalOpen, setClubModalOpen] = useState(false);
  const [clubSnapshot, setClubSnapshot] = useState(null);
  const [methodModalOpen, setMethodModalOpen] = useState(false);
  const [methodSnapshot, setMethodSnapshot] = useState(null);

  const formation = FORMATIONS.find(f => f.key === formationKey) || FORMATIONS[0];
  const methodLabel = NEWGENS_METHODS.find(m => m.key === method)?.label || method;
  const summary = `${selectedClub || 'Aucun club'} • ${formation.label} • ${methodLabel}`;

  const selectedSnapshot = useMemo(
    () => snapshots.find(s => s.id === selectedSnapshotId) || null,
    [snapshots, selectedSnapshotId]
  );

  const scopedPlayers = useMemo(
    () => (selectedSnapshot ? Object.values(selectedSnapshot.players) : []),
    [selectedSnapshot]
  );

  const profileByKey = useMemo(
    () => Object.fromEntries(getMethodProfiles(method).map(p => [p.key, p])),
    [method]
  );

  const slots = useMemo(
    () => buildPitchDepth(scopedPlayers, formation, method),
    [scopedPlayers, formation, method]
  );

  const lockedSlot = locked ? slots.find(s => s.id === locked.slotId) : null;
  const selectedEntry = lockedSlot
    ? (lockedSlot.ranked.find(e => e.player.id === locked.playerId) || lockedSlot.main)
    : null;

  function handleSelectSlot(slot, entry) {
    setLocked({ slotId: slot.id, playerId: entry ? entry.player.id : null });
  }

  function handleSelectEntry(entry) {
    if (!lockedSlot) return;
    setLocked({ slotId: lockedSlot.id, playerId: entry.player.id });
  }

  function handleFormationChange(key) {
    setFormationKey(key);
    setLocked(null);
  }

  function handleClubChange(club) {
    setSelectedClub(club);
    const mostRecent = importsByClub.get(club)?.[0]?.id || null;
    setSelectedSnapshotId(mostRecent);
    setLocked(null);
  }

  function handleSnapshotChange(snapshotId) {
    setSelectedSnapshotId(snapshotId);
    setLocked(null);
  }

  function handleMethodChange(newMethod) {
    setMethod(newMethod);
    setLocked(null);
  }

  function openFormationModal() {
    setFormationSnapshot(formationKey);
    setFormationModalOpen(true);
  }
  function cancelFormationModal() {
    if (formationSnapshot) handleFormationChange(formationSnapshot);
    setFormationModalOpen(false);
  }
  function applyFormationModal() {
    setFormationModalOpen(false);
  }

  function openClubModal() {
    setClubSnapshot({ selectedClub, selectedSnapshotId });
    setClubModalOpen(true);
  }
  function cancelClubModal() {
    if (clubSnapshot) {
      setSelectedClub(clubSnapshot.selectedClub);
      setSelectedSnapshotId(clubSnapshot.selectedSnapshotId);
      setLocked(null);
    }
    setClubModalOpen(false);
  }
  function applyClubModal() {
    setClubModalOpen(false);
  }

  function openMethodModal() {
    setMethodSnapshot(method);
    setMethodModalOpen(true);
  }
  function cancelMethodModal() {
    if (methodSnapshot) handleMethodChange(methodSnapshot);
    setMethodModalOpen(false);
  }
  function applyMethodModal() {
    setMethodModalOpen(false);
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
      <p className="depth-intro">
        Chaque poste affiche son titulaire et sa doublure, notés selon leurs attributs. Survole une carte pour son détail, clique un poste pour verrouiller le panneau.
      </p>

      <div className="depth-controls">
        <button type="button" className="depth-config-btn" onClick={openFormationModal}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
            <path d="M3.5 10.5h17M9 4.5v15" />
          </svg>
          Formation
        </button>
        <button type="button" className="depth-config-btn" onClick={openClubModal}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M4 21V6.5a2 2 0 0 1 1.2-1.83l6-2.57a2 2 0 0 1 1.6 0l6 2.57A2 2 0 0 1 20 6.5V21" />
            <path d="M9 21v-5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v5M9 10h.01M15 10h.01M12 10h.01" />
          </svg>
          Club
        </button>
        <button type="button" className="depth-config-btn" onClick={openMethodModal}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
            <path d="M12 3l1.9 4.6L18.5 9l-4.6 1.9L12 15.5l-1.9-4.6L5.5 9l4.6-1.9L12 3Z" />
            <path d="M19 15.5l.8 1.9 1.9.8-1.9.8-.8 1.9-.8-1.9-1.9-.8 1.9-.8.8-1.9Z" />
          </svg>
          Méthode
        </button>
      </div>

      <div className="depth-layout">
        <DepthPitch
          formation={formation}
          slots={slots}
          lockedSlotId={locked?.slotId || null}
          onSelectSlot={handleSelectSlot}
          onClear={() => setLocked(null)}
        />

        <div className="depth-panel">
          {!lockedSlot ? (
            <div className="depth-panel-placeholder">
              Clique un poste sur le terrain pour voir le détail du joueur et sa profondeur.
            </div>
          ) : (
            <DepthDetailPanel
              slot={lockedSlot}
              entry={selectedEntry}
              profileByKey={profileByKey}
              method={method}
              onSelectEntry={handleSelectEntry}
            />
          )}
        </div>
      </div>

      <div className="depth-legend">
        <span className="depth-legend-label">Statut du poste :</span>
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
          onSelectFormation={handleFormationChange}
          summary={summary}
          onCancel={cancelFormationModal}
          onApply={applyFormationModal}
        />
      )}

      {clubModalOpen && (
        <DepthClubModal
          clubs={clubs}
          importsByClub={importsByClub}
          selectedClub={selectedClub}
          onSelectClub={handleClubChange}
          selectedSnapshotId={selectedSnapshotId}
          onSelectSnapshot={handleSnapshotChange}
          summary={summary}
          onCancel={cancelClubModal}
          onApply={applyClubModal}
        />
      )}

      {methodModalOpen && (
        <DepthMethodModal
          method={method}
          onSelectMethod={handleMethodChange}
          summary={summary}
          onCancel={cancelMethodModal}
          onApply={applyMethodModal}
        />
      )}
    </div>
  );
}
