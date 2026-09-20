const STORAGE_KEY = 'fm26-tracker-depth-formation-v1';

// Dernière formation choisie par club sur la page Profondeur d'effectif : { [club]:
// formationKey }, pour retrouver sa tactique en revenant sur la page plutôt que de repartir
// du schéma par défaut à chaque fois.
function loadAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function loadClubFormation(club, fallback) {
  if (!club) return fallback;
  return loadAll()[club] || fallback;
}

export function saveClubFormation(club, formationKey) {
  if (!club) return;
  const all = loadAll();
  all[club] = formationKey;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
}
