const FOLDER_KEY = 'fm26-tracker-facepack-folder-v1';

export function isElectron() {
  return typeof window !== 'undefined' && !!window.electronAPI?.isElectron;
}

export function loadFacepackFolder() {
  try {
    return localStorage.getItem(FOLDER_KEY) || null;
  } catch {
    return null;
  }
}

export function saveFacepackFolder(folderPath) {
  try {
    if (folderPath) localStorage.setItem(FOLDER_KEY, folderPath);
    else localStorage.removeItem(FOLDER_KEY);
  } catch {
    // localStorage indisponible : rien à faire, la session en cours reste fonctionnelle.
  }
}

// À appeler une fois au démarrage : le process principal Electron ne persiste rien
// lui-même (voir electron/main.cjs), seul le renderer garde le chemin choisi en
// localStorage — on le lui retransmet donc à chaque lancement de l'appli.
export function syncFacepackFolder() {
  if (!isElectron()) return;
  const folder = loadFacepackFolder();
  if (folder) window.electronAPI.setFacepackFolder(folder);
}

// Ouvre le sélecteur de dossier (dialogue natif) et retient le choix. Ne fait rien hors
// Electron (pas de version web pour cette fonctionnalité : un facepack peut peser
// plusieurs Go, impossible à gérer proprement depuis un simple <input type="file">).
export async function pickFacepackFolder() {
  if (!isElectron()) return null;
  const result = await window.electronAPI.selectFacepackFolder();
  if (!result || result.canceled) return null;
  saveFacepackFolder(result.folderPath);
  return result.folderPath;
}

// URL à donner telle quelle à un <img src=...> : le process principal résout
// <dossier>/<nom de fichier>.png à la demande (jamais chargé en mémoire ni copié dans
// l'appli). Le nom attendu est l'"Unique ID" FM26 du joueur (colonne à ajouter à l'export
// CSV si elle n'y est pas déjà) — c'est cet identifiant, stable et propre à chaque joueur
// dans le jeu, qui sert de convention de nommage pour un facepack, pas l'id interne de
// l'appli (nom normalisé, utilisé pour le tri/les groupes/la navigation). On ne retombe sur
// ce dernier que si aucun "Unique ID" n'a été importé.
export function getPlayerPhotoUrl(player) {
  const key = player?.uid || player?.id;
  if (!key) return null;
  return `facepack://photos/${encodeURIComponent(key)}.png`;
}

export function folderDisplayName(folderPath) {
  if (!folderPath) return '';
  return folderPath.split(/[\\/]/).filter(Boolean).pop() || folderPath;
}
