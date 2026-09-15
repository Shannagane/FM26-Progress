// Couleur d'accent dédiée à chaque poste (une teinte par poste, et non par grande
// catégorie), utilisée pour distinguer visuellement les cartes de résultats sur la
// fiche joueur du Labo des Postes.
const POLY_POSITION_COLORS = {
  gk: '#22C55E',
  dc: '#3B82F6',
  dlr: '#0EA5E9',
  wblr: '#14B8A6',
  mdc: '#8e0cda',
  mc: '#A855F7',
  amlr: '#F59E0B',
  amc: '#F97316',
  stc: '#EF4444'
};

const FM26_POSITION_COLORS = {
  gk: '#22C55E',
  cb: '#3B82F6',
  fb: '#0EA5E9',
  wb: '#14B8A6',
  cm: '#8e0cda',
  am: '#F59E0B',
  winger: '#F97316',
  st: '#EF4444'
};

export function getPositionColor(profileKey, method) {
  const table = method === 'fm26' ? FM26_POSITION_COLORS : POLY_POSITION_COLORS;
  return table[profileKey] || '#3B82F6';
}
