const STORAGE_KEY = 'fm26-tracker-groups-v1';

function generateGroupId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `group-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

// Un "groupe" = un nom + une liste d'ids de joueurs (id stable = nom normalisé, voir
// csvParser.js), indépendant des imports. Persisté séparément des snapshots puisqu'il
// s'agit d'un classement manuel de l'utilisateur, pas d'une donnée issue du CSV.
export function loadGroups() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function save(groups) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(groups));
}

export function addGroup(existingGroups, name, playerIds, club) {
  const group = { id: generateGroupId(), name: name.trim(), playerIds, club: club || null };
  const updated = [...existingGroups, group];
  save(updated);
  return updated;
}

export function removeGroup(existingGroups, groupId) {
  const updated = existingGroups.filter(g => g.id !== groupId);
  save(updated);
  return updated;
}

export function updateGroup(existingGroups, groupId, name, playerIds) {
  const updated = existingGroups.map(g => (
    g.id === groupId ? { ...g, name: name.trim(), playerIds } : g
  ));
  save(updated);
  return updated;
}

// Supprime les groupes qui n'ont plus aucun joueur présent dans l'effectif actuel (ex : le
// dernier import d'un club a été supprimé) : appelée après toute suppression d'import.
export function pruneOrphanedGroups(players) {
  const groups = loadGroups();
  const playerIds = new Set(players.map(p => p.id));
  const kept = groups.filter(g => g.playerIds.some(id => playerIds.has(id)));
  if (kept.length !== groups.length) save(kept);
  return kept;
}
