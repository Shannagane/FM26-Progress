import { normalize } from '../utils/text.js';

// Classement communautaire (approximatif) des personnalités FM, du plus "pro" au moins
// déterminé. Il n'existe pas de liste officielle publiée par Sports Interactive : ce
// classement peut être ajusté si l'ordre ne correspond pas à tes attentes.
export const PERSONALITY_RANKING = [
  'Citoyen modèle',
  'Modèle de professionalisme',
  'Professionnel',
  'Perfectionniste',
  'Résolu',
  'Enthousiaste',
  'Assez professionnel',
  'Ferme',
  'Enjoué',
  'Déterminé',
  'Ambitieux',
  'Assez ambitieux',
  'Assez déterminé',
  'Loyal',
  "Assez loyal",
  'Discipliné',
  'Sans ambition',
  'Réaliste',
  'Équilibré',
  'Mercenaire',
  'Faible détermination',
  'Faible confiance en soi',
  'Versatile',
  'Forte personnalité',
  'Décontracté',
  'Occasionnel'
  
];

// Classement communautaire (approximatif) des rapports média, du plus facile à gérer au
// moins facile. Ajustable pour les mêmes raisons que ci-dessus.
export const MEDIA_HANDLING_RANKING = [
  'Imperturbable',
  'Évasif, Imperturbable',
  'Évasif, Réservé',
  'Réservé',
  'Évasif',
  'Spontané',
  'Imperturbable, Apprécié des médias',
  'Apprécié des médias, Réservé',
  'Équilibré',
  'Apprécié des médias',
  'Apprécié des médias, Conflictuel',
  'Versatile, Apprécié des médias',
  'Spontané, Versatile, Conflictuel',
  'Versatile, Conflictuel',
  'Versatile, Apprécié des médias, Conflictuel'
];

function buildRankIndex(list) {
  const map = new Map();
  list.forEach((value, i) => map.set(normalize(value), i));
  return map;
}

const PERSONALITY_INDEX = buildRankIndex(PERSONALITY_RANKING);
const MEDIA_HANDLING_INDEX = buildRankIndex(MEDIA_HANDLING_RANKING);

// Rang d'une valeur dans son classement (0 = meilleur). Une valeur absente du CSV ou non
// reconnue est placée après toutes les valeurs connues, pour rester en bas du tri sans
// casser l'ordre entre elles.
export function personalityRank(value) {
  if (!value) return Infinity;
  const key = normalize(value);
  return PERSONALITY_INDEX.has(key) ? PERSONALITY_INDEX.get(key) : PERSONALITY_RANKING.length;
}

export function mediaHandlingRank(value) {
  if (!value) return Infinity;
  const key = normalize(value);
  return MEDIA_HANDLING_INDEX.has(key) ? MEDIA_HANDLING_INDEX.get(key) : MEDIA_HANDLING_RANKING.length;
}
