import { describeFootPreference, FOOT_CHECK_POSITION_KEYS } from './footPreference.js';

// Coordonnées (x, y en %, viewBox 0-100 / 0-140) de chaque poste sur le terrain vertical,
// du but de son équipe (y élevé) vers le but adverse (y faible). Les postes larges
// (side: true) n'ont pas de x fixe : il est résolu selon le pied fort du joueur.
const POLY_PITCH_COORDS = {
  gk: { x: 50, y: 133 },
  dc: { x: 50, y: 112 },
  dlr: { side: true, y: 112 },
  wblr: { side: true, y: 90 },
  mdc: { x: 50, y: 78 },
  mc: { x: 50, y: 60 },
  amlr: { side: true, y: 40 },
  amc: { x: 50, y: 38 },
  stc: { x: 50, y: 16 }
};

const SIDE_X = { left: 18, right: 82 };

// Position (x, y) d'un poste sur le terrain pour un joueur donné. Pour un poste large,
// le côté (gauche/droite) suit la recommandation de pied de `footPreference.js` ; sans
// donnée de pied exploitable, le poste est placé au centre de sa ligne.
export function getPitchPosition(profileKey, player) {
  const coord = POLY_PITCH_COORDS[profileKey];
  if (!coord) return null;
  if (!coord.side) return { x: coord.x, y: coord.y };

  const isFootDependent = FOOT_CHECK_POSITION_KEYS.includes(profileKey);
  const side = isFootDependent ? describeFootPreference(player, false)?.side : null;
  return { x: SIDE_X[side] ?? 50, y: coord.y };
}
