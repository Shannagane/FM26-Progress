import { COLUMN_BY_KEY, DEFAULT_COLUMN_KEYS } from '../data/columnsConfig.js';

const STORAGE_KEY = 'fm26-tracker-squad-columns-v1';

// Colonnes personnalisées du tableau Effectif : préférence unique, partagée par tous les
// clubs/groupes (comme le reste de l'affichage de la page).
export function loadColumnKeys() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [...DEFAULT_COLUMN_KEYS];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [...DEFAULT_COLUMN_KEYS];
    const valid = parsed.filter(key => COLUMN_BY_KEY[key]);
    return valid.length > 0 ? valid : [...DEFAULT_COLUMN_KEYS];
  } catch {
    return [...DEFAULT_COLUMN_KEYS];
  }
}

export function saveColumnKeys(keys) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(keys));
}
