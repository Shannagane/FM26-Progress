import { getPlayerSnapshots } from './storage.js';

// Libellé de saison à partir d'une date en jeu, convention européenne (juillet -> juin).
// Ex : juillet 2026 à juin 2027 => "2026/2027".
export function seasonLabel(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Saison inconnue';
  const year = d.getFullYear();
  const month = d.getMonth() + 1; // 1-12
  return month >= 7 ? `${year}/${year + 1}` : `${year - 1}/${year}`;
}

// Regroupe l'historique d'un joueur par saison. Chaque groupe expose les stats du DERNIER
// import de la saison (valeurs cumulées les plus à jour pour cette saison), et est trié
// de la saison la plus récente à la plus ancienne.
export function groupSeasons(snapshots, playerId) {
  const history = getPlayerSnapshots(snapshots, playerId); // ordre chronologique croissant
  const groups = new Map();

  history.forEach(entry => {
    const label = seasonLabel(entry.gameDate);
    if (!groups.has(label)) groups.set(label, []);
    groups.get(label).push(entry);
  });

  const seasons = Array.from(groups.entries()).map(([label, entries]) => ({
    label,
    entries,
    latest: entries[entries.length - 1].player,
    startDate: entries[0].gameDate,
    endDate: entries[entries.length - 1].gameDate,
    importCount: entries.length
  }));

  seasons.sort((a, b) => new Date(b.startDate) - new Date(a.startDate));
  return seasons;
}
