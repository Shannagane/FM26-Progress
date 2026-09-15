// Surlignage des attributs clés par groupe de postes (indépendant de la valeur du joueur).
// Paliers : S (rouge), A (orange), B (jaune), C (vert), D (bleu)
import { getPositionCategory } from './positionCategories.js';

const GARDIEN_TIERS = {
  reflexes: 'S',
  agilite: 'A',
  acceleration: 'B',
  un_contre_un: 'C',
  anticipation: 'D',
  communication: 'D',
  concentration: 'D',
  dégagements : 'D',
  placement: 'D',
  prises_de_balle : 'D',
  sorties_dans_la_surface: 'D'
};

const DEFENSIF_TIERS = {
  acceleration: 'S',
  vitesse: 'S',
  detente_verticale: 'A',
  endurance: 'A',
  anticipation: 'A',
  dribbles: 'A',
  agilite: 'B',
  equilibre: 'B',
  puissance: 'B',
  concentration: 'B',
  volume_de_jeu: 'B',
  finition: 'B',
  determination: 'C',
  jeu_de_tete: 'C',
  'Qualités phys. nat.': 'D',
  controle_balle: 'D',
  tacles: 'D'
};

const OFFENSIF_TIERS = {
  acceleration: 'S',
  vitesse: 'S',
  detente_verticale: 'A',
  endurance: 'A',
  anticipation: 'A',
  dribbles: 'A',
  agilite: 'B',
  equilibre: 'B',
  puissance: 'B',
  concentration: 'B',
  volume_de_jeu: 'B',
  finition: 'B',
  determination: 'C',
  centre: 'C',
  tir_de_loin: 'C',
  jeu_de_tete: 'C',
  'Qualités phys. nat.': 'D',
  decisions: 'D',
  sang_froid: 'D',
  controle_balle: 'D',
  passes: 'D',
  technique: 'D'
};

const GROUP_TIERS = {
  gardien: GARDIEN_TIERS,
  defensif: DEFENSIF_TIERS,
  offensif: OFFENSIF_TIERS
};

// Les 5 catégories de la page Effectif sont regroupées en 3 groupes de surlignage
const CATEGORY_TO_GROUP = {
  gardien: 'gardien',
  defenseur: 'defensif',
  milieu: 'defensif',
  ailier: 'offensif',
  attaquant: 'offensif',
  autre: null
};

export const TIER_LEGEND = [
  { tier: 'S', label: 'S' },
  { tier: 'A', label: 'A' },
  { tier: 'B', label: 'B' },
  { tier: 'C', label: 'C' },
  { tier: 'D', label: 'D' }
];

// Retourne le palier ('S'|'A'|'B'|'C'|'D') d'un attribut pour un poste donné, ou null
export function getAttributeTier(poste, key) {
  const category = getPositionCategory(poste);
  const group = CATEGORY_TO_GROUP[category.key];
  if (!group) return null;
  return GROUP_TIERS[group][key] || null;
}

// Classe CSS à appliquer à la ligne d'attribut, ou chaîne vide
export function attributeTierClass(poste, key) {
  const tier = getAttributeTier(poste, key);
  return tier ? `attribute-tier-${tier}` : '';
}
