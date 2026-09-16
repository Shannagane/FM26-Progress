// Un joueur est considéré "Newgens" si la valeur brute du champ CSV "Date commencement
// contrat" vaut exactement "date#1" (les regens fraîchement générés dans FM26 n'ont pas de
// vraie date de contrat renseignée : l'export contient ce texte à la place). Comparaison
// littérale sur la valeur brute, sans tenter de la parser comme une date.
export function isNewgenByContract(player) {
  const raw = (player.date_debut_contrat ?? '').toString().trim();
  return raw === 'date#1';
}
