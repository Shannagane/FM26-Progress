const STORAGE_KEY = 'fm26-tracker-depth-assignments-v1';

export const MAX_PLAYERS_PER_SLOT = 8;

// Affectations manuelles de la page Profondeur d'effectif : { [club]: { [snapshotId]:
// { [formationKey]: { [slotId]: [playerId, ...] } } } }. Propres au club, à l'import précis et
// à la formation (les postes ne se correspondent pas forcément d'un schéma à l'autre) — changer
// d'import repart donc d'un terrain vide pour ce club, même si les ids joueurs restent stables
// d'un import à l'autre (nom normalisé, voir csvParser.js).
function loadAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function saveAll(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function loadFormationAssignments(club, snapshotId, formationKey) {
  if (!club || !snapshotId) return {};
  return loadAll()[club]?.[snapshotId]?.[formationKey] || {};
}

export function saveSlotAssignment(club, snapshotId, formationKey, slotId, playerIds) {
  if (!club || !snapshotId) return;
  const all = loadAll();
  if (!all[club]) all[club] = {};
  if (!all[club][snapshotId]) all[club][snapshotId] = {};
  if (!all[club][snapshotId][formationKey]) all[club][snapshotId][formationKey] = {};
  all[club][snapshotId][formationKey][slotId] = playerIds.slice(0, MAX_PLAYERS_PER_SLOT);
  saveAll(all);
}
