import { isGoalkeeper, normPoste } from './positionOrder.js';

// Deux méthodes d'analyse disponibles pour l'onglet Newgens, sélectionnables par
// l'utilisateur : la méthode FM23/FM24 (9 postes, coefficients fournis par l'utilisateur)
// et la méthode "FM26" (inspirée d'attribute_rating.py : 8 postes, note pondérée avec
// pénalité sous 11, normalisée par la somme des poids utilisés).
export const NEWGENS_METHODS = [
  { key: 'polynomial', label: 'Méthode FM23, FM24' },
  { key: 'fm26', label: 'Méthode FM26' }
];

// ---------------------------------------------------------------------------
// Méthode FM23/FM24 : score = Σ (valeur × coefficient), sans normalisation.
// ---------------------------------------------------------------------------
const POLYNOMIAL_PROFILES = [
  {
    key: 'gk',
    label: 'Gardien',
    shortLabel: 'GK',
    color: 'green',
    coefficients: {
      agilite: 0.01464,
      reflexes: 0.012837,
      detente: 0.011812, // Jeu aérien (Aerial Reach)
      degagements: 0.007465,
      sang_froid: 0.007436,
      prises_de_balle: 0.006255,
      decisions: 0.005089
    }
  },
  {
    key: 'dc',
    label: 'Défenseur Central',
    shortLabel: 'DC',
    color: 'blue',
    coefficients: {
      detente_verticale: 0.022608,
      vitesse: 0.015882,
      acceleration: 0.013536,
      volume_de_jeu: 0.010819,
      anticipation: 0.010326,
      placement: 0.008864,
      passes: 0.008826,
      concentration: 0.008358
    }
  },
  {
    key: 'dlr',
    label: 'Latéral',
    shortLabel: 'DLR',
    color: 'blue',
    coefficients: {
      vitesse: 0.020497,
      dribbles: 0.014018,
      acceleration: 0.012883,
      sang_froid: 0.012072,
      vision_du_jeu: 0.011542,
      detente_verticale: 0.01115,
      centre: 0.010598,
      endurance: 0.009658
    }
  },
  {
    key: 'wblr',
    label: 'Latéral Offensif',
    shortLabel: 'WBLR',
    color: 'blue',
    coefficients: {
      vitesse: 0.019196,
      acceleration: 0.018585,
      detente_verticale: 0.013761,
      sang_froid: 0.011762,
      vision_du_jeu: 0.010025,
      centre: 0.009596,
      volume_de_jeu: 0.008166,
      determination: 0.005121
    }
  },
  {
    key: 'mdc',
    label: 'Milieu Défensif',
    shortLabel: 'MDC',
    color: 'violet',
    coefficients: {
      acceleration: 0.020572,
      anticipation: 0.013047,
      endurance: 0.010352,
      detente_verticale: 0.009796,
      sang_froid: 0.00947,
      passes: 0.009114,
      tir_de_loin: 0.007952,
      dribbles: 0.007338
    }
  },
  {
    key: 'mc',
    label: 'Milieu Centre',
    shortLabel: 'MC',
    color: 'violet',
    coefficients: {
      anticipation: 0.014011,
      acceleration: 0.012595,
      sang_froid: 0.012589,
      vitesse: 0.012156,
      centre: 0.0101,
      dribbles: 0.008134,
      detente_verticale: 0.007918,
      puissance: 0.006528
    }
  },
  {
    key: 'amlr',
    label: 'Ailier',
    shortLabel: 'AMLR/MRL',
    color: 'orange',
    coefficients: {
      vitesse: 0.023458,
      acceleration: 0.01964,
      anticipation: 0.01516,
      centre: 0.014857,
      dribbles: 0.013533,
      detente_verticale: 0.013029,
      technique: 0.012662,
      sang_froid: 0.012295
    }
  },
  {
    key: 'amc',
    label: 'Milieu Offensif',
    shortLabel: 'AMC',
    color: 'orange',
    coefficients: {
      vitesse: 0.016763,
      acceleration: 0.016348,
      concentration: 0.013697,
      sang_froid: 0.012813,
      technique: 0.011647,
      tir_de_loin: 0.009914,
      detente_verticale: 0.009524,
      dribbles: 0.008679
    }
  },
  {
    key: 'stc',
    label: 'Buteur',
    shortLabel: 'STC',
    color: 'red',
    coefficients: {
      detente_verticale: 0.020557,
      vitesse: 0.020096,
      acceleration: 0.014496,
      concentration: 0.013675,
      equilibre: 0.012043,
      dribbles: 0.010739,
      vision_du_jeu: 0.009392,
      sang_froid: 0.009161
    }
  }
];

// Note maximale théorique d'un profil polynomial (un joueur noté 20 sur chaque attribut
// pondéré), utilisée pour convertir la note brute en pourcentage à l'affichage.
POLYNOMIAL_PROFILES.forEach(profile => {
  profile.maxScore = 20 * Object.values(profile.coefficients).reduce((sum, c) => sum + c, 0);
});

function scorePolynomial(player, profile) {
  let score = 0;
  let hasAnyValue = false;
  Object.entries(profile.coefficients).forEach(([attrKey, coefficient]) => {
    const raw = player.attributes?.[attrKey];
    if (raw === undefined || raw === null || raw === '') return;
    const value = Number(raw);
    if (Number.isNaN(value)) return;
    hasAnyValue = true;
    score += value * coefficient;
  });
  return hasAnyValue ? score : null;
}

// ---------------------------------------------------------------------------
// Méthode FM26 : reprend la logique d'attribute_rating.py — score = moyenne des
// attributs pondérée par poste, avec pénalité pour toute valeur < 11 (pour encourager
// le développement des points faibles), normalisée par la somme des poids utilisés.
// Le gardien (GK) n'était pas géré par le script d'origine (aucune entrée dans
// position_weights) : le profil ci-dessous a été construit spécifiquement pour cette
// app, dans le même esprit (poids sommant à 1.00) que les autres postes.
// ---------------------------------------------------------------------------
const FM26_PROFILES = [
  {
    key: 'gk',
    label: 'Gardien',
    shortLabel: 'GK',
    color: 'green',
    weights: {
      reflexes: 0.18,
      agilite: 0.13,
      detente: 0.12, // Jeu aérien (Aerial Reach)
      prises_de_balle: 0.11,
      un_contre_un: 0.10,
      placement: 0.09,
      communication: 0.08,
      decisions: 0.08,
      concentration: 0.06,
      relance_a_la_main: 0.05
    }
  },
  {
    key: 'cb',
    label: 'Défenseur Central',
    shortLabel: 'CB',
    color: 'blue',
    weights: {
      marquage: 0.10,
      tacles: 0.10,
      jeu_de_tete: 0.08,
      placement: 0.11,
      concentration: 0.06,
      anticipation: 0.07,
      vitesse: 0.14,
      acceleration: 0.13,
      detente_verticale: 0.09,
      puissance: 0.08,
      agilite: 0.04
    }
  },
  {
    key: 'fb',
    label: 'Arrière Latéral',
    shortLabel: 'FB',
    color: 'blue',
    weights: {
      tacles: 0.07,
      marquage: 0.06,
      centre: 0.08,
      placement: 0.05,
      controle_balle: 0.05,
      vitesse: 0.20,
      acceleration: 0.17,
      endurance: 0.13,
      agilite: 0.06,
      puissance: 0.06,
      detente_verticale: 0.07
    }
  },
  {
    key: 'wb',
    label: 'Piston',
    shortLabel: 'WB',
    color: 'blue',
    weights: {
      centre: 0.09,
      dribbles: 0.06,
      controle_balle: 0.06,
      tacles: 0.06,
      volume_de_jeu: 0.05,
      placement: 0.05,
      vitesse: 0.21,
      acceleration: 0.18,
      endurance: 0.15,
      agilite: 0.09
    }
  },
  {
    key: 'cm',
    label: 'Milieu Central',
    shortLabel: 'CM',
    color: 'violet',
    weights: {
      endurance: 0.09,
      passes: 0.10,
      tacles: 0.09,
      anticipation: 0.08,
      volume_de_jeu: 0.12,
      placement: 0.07,
      vision_du_jeu: 0.07,
      vitesse: 0.07,
      acceleration: 0.06,
      agilite: 0.06,
      controle_balle: 0.06,
      puissance: 0.06,
      appels_de_balle: 0.07
    }
  },
  {
    key: 'am',
    label: 'Milieu Offensif',
    shortLabel: 'AM',
    color: 'orange',
    weights: {
      passes: 0.11,
      controle_balle: 0.08,
      vision_du_jeu: 0.09,
      dribbles: 0.07,
      sang_froid: 0.06,
      technique: 0.07,
      appels_de_balle: 0.06,
      volume_de_jeu: 0.04,
      vitesse: 0.13,
      acceleration: 0.14,
      agilite: 0.08,
      endurance: 0.07
    }
  },
  {
    key: 'winger',
    label: 'Ailier',
    shortLabel: 'Winger',
    color: 'orange',
    weights: {
      dribbles: 0.07,
      centre: 0.06,
      controle_balle: 0.05,
      technique: 0.04,
      inspiration: 0.04,
      volume_de_jeu: 0.04,
      vitesse: 0.22,
      acceleration: 0.20,
      endurance: 0.13,
      agilite: 0.09,
      equilibre: 0.06
    }
  },
  {
    key: 'st',
    label: 'Attaquant',
    shortLabel: 'ST',
    color: 'red',
    weights: {
      finition: 0.13,
      appels_de_balle: 0.08,
      sang_froid: 0.08,
      controle_balle: 0.06,
      jeu_de_tete: 0.05,
      anticipation: 0.06,
      volume_de_jeu: 0.05,
      agressivite: 0.04,
      vitesse: 0.18,
      acceleration: 0.14,
      puissance: 0.09,
      detente_verticale: 0.04
    }
  }
];

// Compatibilité de poste (reprise de `position_compatibility` dans attribute_rating.py) :
// un joueur n'est comparé qu'aux postes compatibles avec son poste actuel (colonne
// "M. Poste" du CSV). Ex : un défenseur central peut être évalué comme latéral ou milieu
// central, mais pas comme attaquant. Le poste "WB" ne figurant pas dans le script
// d'origine, sa compatibilité a été extrapolée de celle du poste FB.
const FM26_COMPATIBILITY = {
  cb: ['cb', 'fb', 'cm'],
  fb: ['fb', 'cb', 'cm'],
  wb: ['wb', 'fb', 'cm'],
  cm: ['cm', 'cb', 'fb', 'am'],
  am: ['am', 'cm', 'winger', 'st'],
  winger: ['winger', 'am', 'st'],
  st: ['st', 'am', 'winger']
};

// Classe le poste FM26 (colonne "M. Poste" du CSV) dans l'un des 8 groupes standardisés
// de la méthode FM26, pour appliquer la règle de compatibilité ci-dessus. Renvoie null si
// le poste est absent ou non reconnu (aucune restriction n'est alors appliquée).
// Exportée : également utilisée pour classer les postes exacts du terrain (page Profondeur
// d'effectif), qui a besoin de la même correspondance code -> groupe de poids.
export function classifyFm26Group(poste) {
  const p = normPoste(poste);
  if (!p) return null;
  if (p === 'GB') return 'gk';
  if (p === 'D(C)') return 'cb';
  if (p === 'D(D)' || p === 'D(G)') return 'fb';
  if (p === 'AL(D)' || p === 'AL(G)') return 'wb';
  if (p === 'MD' || p === 'M(C)') return 'cm';
  if (p === 'MO(C)') return 'am';
  if (p === 'MO(D)' || p === 'MO(G)' || p === 'M(D)' || p === 'M(G)') return 'winger';
  if (p === 'BT(C)') return 'st';
  return null;
}

function scoreFm26(player, profile) {
  let score = 0;
  let totalWeight = 0;
  Object.entries(profile.weights).forEach(([attrKey, weight]) => {
    const raw = player.attributes?.[attrKey];
    if (raw === undefined || raw === null || raw === '') return;
    const value = Number(raw);
    if (Number.isNaN(value)) return;
    let contribution = value * weight;
    if (value < 11) contribution -= (11 - value) * weight;
    score += contribution;
    totalWeight += weight;
  });
  return totalWeight === 0 ? null : score / totalWeight;
}

// ---------------------------------------------------------------------------
// API commune aux deux méthodes.
// ---------------------------------------------------------------------------
function methodTables(method) {
  return method === 'fm26'
    ? { profiles: FM26_PROFILES, score: scoreFm26 }
    : { profiles: POLYNOMIAL_PROFILES, score: scorePolynomial };
}

export function getMethodProfiles(method) {
  return methodTables(method).profiles;
}

// Note un joueur pour UN groupe de poids donné, sans restriction de compatibilité (à la
// différence de computeIdealPosition/scoreAllProfiles). Utilisée par la page Profondeur
// d'effectif : contrairement au Labo des Postes (qui cherche le meilleur poste d'UN joueur),
// elle doit pouvoir noter N'IMPORTE quel joueur à UN poste fixé (ex : "quel est le niveau de
// ce milieu offensif s'il dépanne en latéral droit ?").
export function scoreForGroup(player, groupKey, method = 'fm26') {
  const { profiles, score } = methodTables(method);
  const profile = profiles.find(p => p.key === groupKey);
  if (!profile) return null;
  return score(player, profile);
}

// Restreint les postes candidats pour un joueur donné :
// - un gardien (poste CSV = GB) n'est jamais évalué que comme gardien ;
// - un joueur de champ n'est jamais évalué comme gardien ;
// - en méthode FM26, un joueur de champ n'est comparé qu'aux postes compatibles avec
//   son poste actuel (si celui-ci est reconnu), pour respecter la flexibilité
//   positionnelle réelle (ex : un défenseur central peut jouer latéral ou milieu
//   central, mais pas attaquant) ;
// - en méthode polynomiale (FM23/FM24), aucune restriction de compatibilité n'est
//   appliquée : un joueur de champ est évalué sur tous les postes sauf gardien.
function getCandidateProfiles(player, method) {
  const { profiles } = methodTables(method);
  if (isGoalkeeper(player.poste)) {
    return profiles.filter(p => p.key === 'gk');
  }
  let outfield = profiles.filter(p => p.key !== 'gk');
  if (method === 'fm26') {
    const naturalGroup = classifyFm26Group(player.poste);
    const compatible = naturalGroup && FM26_COMPATIBILITY[naturalGroup];
    if (compatible) {
      const allowed = new Set(compatible);
      outfield = outfield.filter(p => allowed.has(p.key));
    }
  }
  return outfield;
}

// Valeur utilisée pour CLASSER un joueur entre plusieurs postes candidats (potentiellement
// de profils différents). En méthode FM23/FM24, les postes n'ont pas la même somme de
// coefficients (donc pas la même note brute maximale) : comparer les notes brutes entre
// postes différents fausserait le classement. On compare donc le ratio note/maxScore
// (équivalent au pourcentage affiché), pas la note brute. En méthode FM26, la note est
// déjà une moyenne pondérée comparable d'un poste à l'autre : on la compare telle quelle.
function comparableScore(entry, method) {
  if (entry.score === null || entry.score === undefined) return -Infinity;
  if (method === 'fm26' || !entry.profile.maxScore) return entry.score;
  return entry.score / entry.profile.maxScore;
}

// Détermine le poste idéal d'un joueur avec la méthode choisie ('polynomial' par défaut).
// Renvoie { profile, score } ou null si aucun poste candidat n'a pu être noté.
export function computeIdealPosition(player, method = 'polynomial') {
  const { score } = methodTables(method);
  const candidates = getCandidateProfiles(player, method);
  const scored = candidates
    .map(profile => ({ profile, score: score(player, profile) }))
    .filter(entry => entry.score !== null);
  if (scored.length === 0) return null;
  scored.sort((a, b) => comparableScore(b, method) - comparableScore(a, method));
  return scored[0];
}

// Score du joueur pour tous les postes candidats (triés du meilleur au moins bon), pour
// comparer le poste idéal aux autres.
export function scoreAllProfiles(player, method = 'polynomial') {
  const { score } = methodTables(method);
  const candidates = getCandidateProfiles(player, method);
  return candidates
    .map(profile => ({ profile, score: score(player, profile) }))
    .sort((a, b) => comparableScore(b, method) - comparableScore(a, method));
}

// Note idéale en pourcentage de la note maximale théorique du poste (un joueur noté 20
// sur chaque attribut pondéré = 100%). Renvoie null si non applicable (méthode FM26, ou
// poste sans note maximale connue).
export function getIdealScorePercent(score, profile, method = 'polynomial') {
  if (method === 'fm26' || !profile?.maxScore) return null;
  return Math.min(100, Math.max(0, (score / profile.maxScore) * 100));
}

// Met en forme la note idéale pour l'affichage : en pourcentage de la note maximale
// théorique pour la méthode FM23/FM24 (un joueur noté 20 partout = 100%), inchangé
// (note brute) pour la méthode FM26.
export function formatIdealScore(score, profile, method = 'polynomial') {
  const percent = getIdealScorePercent(score, profile, method);
  if (percent === null) return score.toFixed(2);
  return `${percent.toFixed(1)}%`;
}

// Palier de couleur d'une note (brute /max, ou pourcentage /100) : utilisé par le Labo des
// Postes et la page Profondeur d'effectif pour un code couleur cohérent dans toute l'app.
export function scoreTier(value, max = 20) {
  const v = Number(value);
  if (Number.isNaN(v)) return 'orange';
  const ratio = v / max;
  if (ratio >= 0.8) return 'green';
  if (ratio >= 0.55) return 'violet';
  if (ratio >= 0.3) return 'orange';
  return 'red';
}
