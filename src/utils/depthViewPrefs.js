const STORAGE_KEY = 'fm26-tracker-depth-view-v1';

// Mémorise le club et l'import consultés en dernier sur la page Profondeur d'effectif, pour
// qu'en revenant sur la page (après être passé sur une autre) on retombe pile sur la même vue
// (et donc, via loadClubFormation, sur la même formation).
export function loadLastDepthView() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

export function saveLastDepthView(club, snapshotId) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ club, snapshotId }));
}
