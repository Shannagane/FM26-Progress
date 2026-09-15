import { normPoste } from './positionOrder.js';

// Catégories affichées sur la page Effectif, dans cet ordre précis.
// Chaque joueur est classé dans la PREMIÈRE catégorie dont il remplit la condition.
export const POSITION_CATEGORIES = [
  {
    key: 'gardien',
    label: 'Gardien',
    postes: ['GB']
  },
  {
    key: 'defenseur',
    label: 'Défenseur',
    postes: ['D(C)', 'D(G)', 'D(D)', 'AL(D)', 'AL(G)']
  },
  {
    key: 'milieu',
    label: 'Milieu',
    postes: ['MD', 'M(C)', 'MD,M(C)', 'M', 'M(D)', 'M(G)']
  },
  {
    key: 'ailier',
    label: 'Ailier',
    postes: ['MO(D)', 'MO(G)', 'M/MO(DG)']
  },
  {
    key: 'attaquant',
    label: 'Attaquant',
    postes: ['BT(C)', 'M/MO(C)', 'MO(C)']
  },
  {
    key: 'autre',
    label: 'Autre',
    postes: []
  }
];

const CATEGORY_INDEX = new Map();
POSITION_CATEGORIES.forEach(cat => {
  cat.postes.forEach(p => CATEGORY_INDEX.set(p, cat));
});

export function getPositionCategory(poste) {
  const normalized = normPoste(poste);
  return CATEGORY_INDEX.get(normalized) || POSITION_CATEGORIES[POSITION_CATEGORIES.length - 1];
}
