const STORAGE_KEY = 'fm26-tracker-snapshots-v2';
const OLD_STORAGE_KEY = 'fm26-tracker-snapshots-v1';

function generateSnapshotId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID();
  return `snap-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

// Un "snapshot" = un import CSV = { id, csvName, gameDate, importDate, players: { [id]: player } }
// - id         : identifiant unique de l'import, utilisé pour le supprimer individuellement
// - csvName    : nom donné par l'utilisateur à l'import (ex: "Export après J12")
// - gameDate   : date DANS FM26 au moment de l'export (sert de repère chronologique
//                pour classer les imports et tracer les courbes de progression)
// - importDate : date/heure réelle à laquelle le CSV a été chargé dans l'application
//
// `makeSnapshotStore` fabrique un jeu de fonctions load/save/add/remove/clear liées à une
// clé localStorage donnée.
function makeSnapshotStore(storageKey, oldStorageKey) {
  function save(snapshots) {
    localStorage.setItem(storageKey, JSON.stringify(snapshots));
  }

  function load() {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed)) return [];
        // Comble les anciens snapshots enregistrés avant l'ajout de l'id.
        let needsSave = false;
        const withIds = parsed.map(snap => {
          if (snap.id) return snap;
          needsSave = true;
          return { ...snap, id: generateSnapshotId() };
        });
        if (needsSave) save(withIds);
        return withIds;
      }
      // Migration douce depuis l'ancien format (date + label)
      const oldRaw = oldStorageKey ? localStorage.getItem(oldStorageKey) : null;
      if (oldRaw) {
        const oldParsed = JSON.parse(oldRaw);
        if (Array.isArray(oldParsed)) {
          return oldParsed.map(snap => ({
            id: generateSnapshotId(),
            csvName: snap.label || 'Import',
            gameDate: snap.date,
            importDate: snap.date,
            players: snap.players
          }));
        }
      }
      return [];
    } catch {
      return [];
    }
  }

  function add(existingSnapshots, players, gameDate, csvName) {
    const playersMap = Object.fromEntries(players.map(p => [p.id, p]));
    const snapshot = {
      id: generateSnapshotId(),
      csvName: csvName || 'Import sans nom',
      gameDate: gameDate || new Date().toISOString(),
      importDate: new Date().toISOString(),
      players: playersMap
    };
    const updated = [...existingSnapshots, snapshot].sort((a, b) => new Date(a.gameDate) - new Date(b.gameDate));
    save(updated);
    return updated;
  }

  function remove(existingSnapshots, snapshotId) {
    const updated = existingSnapshots.filter(snap => snap.id !== snapshotId);
    save(updated);
    return updated;
  }

  function clear() {
    localStorage.removeItem(storageKey);
    if (oldStorageKey) localStorage.removeItem(oldStorageKey);
  }

  return { load, save, add, remove, clear };
}

const squadStore = makeSnapshotStore(STORAGE_KEY, OLD_STORAGE_KEY);

export const loadSnapshots = squadStore.load;
export const addSnapshot = squadStore.add;
export const removeSnapshot = squadStore.remove;
export const clearSnapshots = squadStore.clear;

// Etat courant = fusion de tous les joueurs vus, avec les données du snapshot le plus
// récent (par date en jeu) où ils apparaissent. `importClub` porte le nom du club saisi
// à l'import (snapshot.csvName), distinct de la colonne "Club" du CSV lui-même.
export function getCurrentPlayers(snapshots) {
  const ordered = [...snapshots].sort((a, b) => new Date(a.gameDate) - new Date(b.gameDate));
  const byId = new Map();
  ordered.forEach(snap => {
    Object.values(snap.players).forEach(p => {
      byId.set(p.id, { ...p, importClub: snap.csvName });
    });
  });
  return Array.from(byId.values());
}

// Historique chronologique d'un joueur : liste de { csvName, gameDate, importDate, player }
export function getPlayerSnapshots(snapshots, playerId) {
  return snapshots
    .filter(snap => snap.players[playerId])
    .map(snap => ({
      csvName: snap.csvName,
      gameDate: snap.gameDate,
      importDate: snap.importDate,
      player: snap.players[playerId]
    }))
    .sort((a, b) => new Date(a.gameDate) - new Date(b.gameDate));
}

// Série de valeurs d'un attribut pour un joueur, pour le graphe de progression
export function getAttributeHistory(snapshots, playerId, attrKey) {
  return getPlayerSnapshots(snapshots, playerId)
    .map(entry => ({
      gameDate: entry.gameDate,
      csvName: entry.csvName,
      value: entry.player.attributes?.[attrKey] ?? null
    }))
    .filter(entry => entry.value !== null && entry.value !== undefined);
}

// Delta entre les deux derniers imports pour un attribut donné
export function getAttributeDelta(snapshots, playerId, attrKey) {
  const history = getPlayerSnapshots(snapshots, playerId);
  if (history.length < 2) return null;
  const last = history[history.length - 1].player.attributes?.[attrKey];
  const prev = history[history.length - 2].player.attributes?.[attrKey];
  if (last === undefined || last === null || prev === undefined || prev === null) return null;
  const delta = Number(last) - Number(prev);
  if (Number.isNaN(delta)) return null;
  return delta;
}
