const STORAGE_KEY = 'fm26-tracker-squad-column-widths-v1';

// Largeurs de colonnes du tableau Effectif (en pixels), par identifiant de colonne :
// 'identity' | 'poste' | 'club' | <clé de colonne personnalisée>. Préférence unique,
// partagée par tous les clubs (comme le reste de l'affichage de la page).
export function loadColumnWidths() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function saveColumnWidths(widths) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(widths));
  } catch {
    // localStorage indisponible : rien à faire, la session en cours reste fonctionnelle.
  }
}
