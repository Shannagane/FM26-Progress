// Parse une date issue du CSV FM26 ("Date commencement contrat"). Format des exports FM :
// JJ/M/AAAA — jour et mois sur 1 ou 2 chiffres (pas de zéro initial obligatoire pour le
// mois, ex : "12/3/2027" = 12 mars 2027), année sur 4 chiffres (2 acceptés aussi). On
// retombe sur le parsing natif du navigateur pour les autres formats (ISO, etc.). Renvoie
// null si illisible.
export function parseFmDate(raw) {
  if (!raw) return null;
  const str = raw.toString().trim();
  if (!str) return null;

  const match = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (match) {
    const [, d, m, y] = match;
    const year = y.length === 2 ? 2000 + Number(y) : Number(y);
    const date = new Date(year, Number(m) - 1, Number(d));
    return Number.isNaN(date.getTime()) ? null : date;
  }

  const fallback = new Date(str);
  return Number.isNaN(fallback.getTime()) ? null : fallback;
}

// Un joueur est considéré "Newgens" si son contrat commence à 1 jour près de la date en jeu
// de l'import (les regens fraîchement générés ont un contrat qui démarre le jour même de
// leur apparition, parfois la veille selon les exports FM26 observés).
export function isNewgenByContract(player, gameDateIso) {
  const contractStart = parseFmDate(player.date_debut_contrat);
  if (!contractStart) return false;

  const gameDate = new Date(gameDateIso);
  if (Number.isNaN(gameDate.getTime())) return false;
  gameDate.setHours(0, 0, 0, 0);

  const lowerBound = new Date(gameDate);
  lowerBound.setDate(lowerBound.getDate() - 1);
  const upperBound = new Date(gameDate);
  upperBound.setDate(upperBound.getDate() + 1);

  const contractDay = new Date(contractStart);
  contractDay.setHours(0, 0, 0, 0);

  return contractDay.getTime() >= lowerBound.getTime() && contractDay.getTime() <= upperBound.getTime();
}
