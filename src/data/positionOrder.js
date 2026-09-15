// Ordre croissant des postes (du plus défensif au plus offensif)
export const POSITION_ORDER_ASC = [
  'GB',
  'D(C)',
  'D(D)',
  'D(G)',
  'AL(D)',
  'AL(G)',
  'MD',
  'M(D)',
  'M(C)',
  'M(G)',
  'MO(D)',
  'MO(C)',
  'MO(G)',
  'BT(C)'
];

const ASC_INDEX = new Map(POSITION_ORDER_ASC.map((p, i) => [p, i]));

// Normalise un poste pour comparaison : majuscules + espaces supprimés.
// Le CSV "M. Poste" de FM26 exporte parfois les postes avec un espace
// ("D (C)") alors que l'ordre de tri interne utilise "D(C)" : on harmonise.
export function normPoste(poste) {
  return (poste || '').toString().trim().toUpperCase().replace(/\s+/g, '');
}

// Retourne un index de tri ; les postes inconnus sont placés en fin de liste
export function positionRank(poste) {
  const normalized = normPoste(poste);
  if (ASC_INDEX.has(normalized)) return ASC_INDEX.get(normalized);
  return POSITION_ORDER_ASC.length + 1;
}

export function comparePositions(a, b, direction = 'asc') {
  const rankA = positionRank(a);
  const rankB = positionRank(b);
  return direction === 'asc' ? rankA - rankB : rankB - rankA;
}

export function isGoalkeeper(poste) {
  return normPoste(poste) === 'GB';
}

// Regroupement des postes par couleur pour le badge de numéro de maillot (page Effectif),
// aligné sur les 5 catégories de la page Effectif (Gardien/Défenseur/Milieu/Ailier/Attaquant).
const POSITION_COLOR_GROUPS = [
  { color: 'green', postes: ['GB'] },
  { color: 'blue', postes: ['D(C)', 'D(G)', 'D(D)', 'AL(D)', 'AL(G)'] },
  { color: 'orange', postes: ['MD', 'M(C)', 'MD,M(C)', 'M', 'M(D)', 'M(G)'] },
  { color: 'teal', postes: ['MO(D)', 'MO(G)', 'M/MO(DG)'] },
  { color: 'red', postes: ['BT(C)', 'M/MO(C)', 'MO(C)'] }
];

const POSITION_COLOR_INDEX = new Map();
POSITION_COLOR_GROUPS.forEach(group => {
  group.postes.forEach(p => POSITION_COLOR_INDEX.set(p, group.color));
});

// Retourne 'green' | 'blue' | 'orange' | 'teal' | 'red' | 'neutral' selon le poste du joueur
export function getPositionColor(poste) {
  return POSITION_COLOR_INDEX.get(normPoste(poste)) || 'neutral';
}
