const STORAGE_KEY = 'fm26-tracker-club-logos-v1';

// Logos de club importés manuellement par l'utilisateur (le CSV FM26 n'en fournit pas) :
// { [nomDuClub]: dataUrl }, persistés à part des imports puisqu'ils ne dépendent pas d'un
// export CSV précis.
export function loadClubLogos() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function saveClubLogo(club, dataUrl) {
  const logos = loadClubLogos();
  logos[club] = dataUrl;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logos));
  return logos;
}
