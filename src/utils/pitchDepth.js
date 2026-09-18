import { normPoste, isGoalkeeper } from '../data/positionOrder.js';
import {
  getMethodProfiles, scoreForGroup, scoreTier, getIdealScorePercent, formatIdealScore
} from '../data/newgensPositionProfiles.js';
import { describeFootPreference } from '../data/footPreference.js';
import { EXACT_CODE_TO_GROUP, POSITION_FALLBACKS } from '../data/formations.js';

const TIER_RANK = { red: 0, orange: 1, violet: 2, green: 3 };

// Statut de profondeur d'un poste exact, à partir de son classement complet (joueurs au
// poste exact d'abord, puis dépanneurs) : un poste sans doublure (0 ou 1 joueur trouvé) est
// toujours Critique, quel que soit le niveau du titulaire — l'absence de solution de repli
// est en soi le risque. Au-delà, le statut suit le niveau du plus faible des deux premiers.
export function depthStatus(ranked) {
  if (ranked.length <= 1) return { tier: 'red', label: 'Critique' };
  const t1 = scoreTier(ranked[0].percent, 100);
  const t2 = scoreTier(ranked[1].percent, 100);
  const worst = Math.min(TIER_RANK[t1], TIER_RANK[t2]);
  if (worst >= 3) return { tier: 'green', label: 'Excellent' };
  if (worst >= 2) return { tier: 'violet', label: 'Bon' };
  return { tier: 'orange', label: 'Faible' };
}

// Note brute (échelle propre à chaque méthode) et pourcentage (toujours 0-100, seule valeur
// utilisée pour la couleur/les étoiles/la barre sur le terrain — la méthode FM23/FM24 a une
// note brute minuscule comparée à la FM26, seul le pourcentage est comparable entre les deux).
function toEntry(player, profile, method, groupKey) {
  const score = scoreForGroup(player, groupKey, method);
  if (score === null) return null;
  const percent = getIdealScorePercent(score, profile, method);
  return {
    player,
    score,
    percent: percent !== null ? percent : Math.max(0, Math.min(100, (score / 20) * 100)),
    scoreLabel: method === 'fm26' ? `${formatIdealScore(score, profile, method)}/20` : formatIdealScore(score, profile, method)
  };
}

// Classe l'effectif pour UN poste exact : d'abord les joueurs dont le poste CSV correspond
// exactement, triés par niveau à ce poste, puis les "dépanneurs" (postes compatibles, voir
// POSITION_FALLBACKS), eux aussi triés par niveau — jamais mélangés, un joueur au poste exact
// prime toujours sur un dépanneur même mieux noté.
function rankForCode(players, code, method) {
  const groupKey = EXACT_CODE_TO_GROUP[method]?.[code];
  if (!groupKey) return [];
  const profile = getMethodProfiles(method).find(p => p.key === groupKey);
  if (!profile) return [];

  const isGkSlot = groupKey === 'gk';
  const eligible = players.filter(p => isGoalkeeper(p.poste) === isGkSlot);
  const fallbackCodes = new Set(POSITION_FALLBACKS[code] || []);

  const primary = [];
  const fallback = [];
  eligible.forEach(player => {
    const entry = toEntry(player, profile, method, groupKey);
    if (!entry) return;
    const poste = normPoste(player.poste);
    if (poste === code) primary.push(entry);
    else if (fallbackCodes.has(poste)) fallback.push(entry);
  });
  primary.sort((a, b) => b.score - a.score);
  fallback.sort((a, b) => b.score - a.score);
  return [...primary, ...fallback];
}

// Pour un poste dessiné plusieurs fois sur le terrain (ex : 2 ou 3 D(C)), détermine quel
// titulaire classé va à quel emplacement précis (positionOrder, trié par x croissant =
// gauche -> droite). Cas particulier des défenseurs centraux : gaucher placé le plus à
// gauche, droitier le plus à droite (pied fort réel du joueur, pas juste son classement) ;
// tout autre poste dupliqué (ou un joueur sans pied fort identifiable) garde l'ordre de
// classement simple.
function assignPrimaries(code, ranked, slotCount) {
  const primaries = ranked.slice(0, slotCount);
  if (code !== 'D(C)' || slotCount < 2) return primaries;

  const remaining = [...primaries];
  const assigned = new Array(slotCount).fill(null);

  const leftIndex = remaining.findIndex(entry => describeFootPreference(entry.player)?.side === 'left');
  if (leftIndex !== -1) assigned[0] = remaining.splice(leftIndex, 1)[0];

  const rightIndex = remaining.findIndex(entry => describeFootPreference(entry.player)?.side === 'right');
  if (rightIndex !== -1) assigned[slotCount - 1] = remaining.splice(rightIndex, 1)[0];

  for (let i = 0; i < slotCount; i++) {
    if (!assigned[i] && remaining.length > 0) assigned[i] = remaining.shift();
  }
  return assigned;
}

// Construit les données du terrain pour un schéma tactique donné : un objet par poste
// dessiné (deux D(C) dans un 4-3-3 = deux objets), avec le titulaire de CE poste précis et,
// derrière lui, la profondeur restante — partagée entre les postes dupliqués (ex : les deux
// D(C) piochent dans le même réservoir de défenseurs centraux).
export function buildPitchDepth(players, formation, method = 'fm26') {
  // Emplacements de chaque poste, triés gauche -> droite (x croissant) : nécessaire pour
  // placer les D(C) selon leur pied fort, quel que soit l'ordre de déclaration du schéma.
  const slotIndexesByCode = new Map();
  formation.slots.forEach((slot, index) => {
    const list = slotIndexesByCode.get(slot.code) || [];
    list.push(index);
    slotIndexesByCode.set(slot.code, list);
  });
  slotIndexesByCode.forEach(list => list.sort((a, b) => formation.slots[a].x - formation.slots[b].x));

  const rankedByCode = new Map();
  slotIndexesByCode.forEach((_, code) => {
    rankedByCode.set(code, rankForCode(players, code, method));
  });

  const mainBySlotIndex = new Map();
  slotIndexesByCode.forEach((slotIndexesAsc, code) => {
    const ranked = rankedByCode.get(code) || [];
    const primaries = assignPrimaries(code, ranked, slotIndexesAsc.length);
    slotIndexesAsc.forEach((slotIndex, i) => mainBySlotIndex.set(slotIndex, primaries[i] || null));
  });

  return formation.slots.map((slot, index) => {
    const ranked = rankedByCode.get(slot.code) || [];
    const slotsForCode = slotIndexesByCode.get(slot.code).length;

    return {
      id: `${slot.code}-${index}`,
      code: slot.code,
      x: slot.x,
      y: slot.y,
      main: mainBySlotIndex.get(index) || null,
      bench: ranked.slice(slotsForCode, slotsForCode + 2),
      ranked,
      status: depthStatus(ranked)
    };
  });
}
