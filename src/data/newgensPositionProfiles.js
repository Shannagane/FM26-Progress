import { isGoalkeeper } from './positionOrder.js';

// ---------------------------------------------------------------------------
// Score polynomial : score = Σ (valeur × coefficient), sans normalisation.
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

export function getMethodProfiles() {
  return POLYNOMIAL_PROFILES;
}

// Restreint les postes candidats pour un joueur donné : un gardien (poste CSV = GB) n'est
// jamais évalué que comme gardien, un joueur de champ jamais comme gardien ; aucune autre
// restriction de compatibilité n'est appliquée (un joueur de champ est évalué sur tous les
// postes sauf gardien).
function getCandidateProfiles(player) {
  if (isGoalkeeper(player.poste)) {
    return POLYNOMIAL_PROFILES.filter(p => p.key === 'gk');
  }
  return POLYNOMIAL_PROFILES.filter(p => p.key !== 'gk');
}

// Valeur utilisée pour CLASSER un joueur entre plusieurs postes candidats (potentiellement
// de profils différents) : les postes n'ont pas la même somme de coefficients (donc pas la
// même note brute maximale), comparer les notes brutes entre postes différents fausserait
// le classement. On compare donc le ratio note/maxScore (équivalent au pourcentage affiché).
function comparableScore(entry) {
  if (entry.score === null || entry.score === undefined) return -Infinity;
  if (!entry.profile.maxScore) return entry.score;
  return entry.score / entry.profile.maxScore;
}

// Détermine le poste idéal d'un joueur. Renvoie { profile, score } ou null si aucun poste
// candidat n'a pu être noté.
export function computeIdealPosition(player) {
  const candidates = getCandidateProfiles(player);
  const scored = candidates
    .map(profile => ({ profile, score: scorePolynomial(player, profile) }))
    .filter(entry => entry.score !== null);
  if (scored.length === 0) return null;
  scored.sort((a, b) => comparableScore(b) - comparableScore(a));
  return scored[0];
}

// Score du joueur pour tous les postes candidats (triés du meilleur au moins bon), pour
// comparer le poste idéal aux autres.
export function scoreAllProfiles(player) {
  const candidates = getCandidateProfiles(player);
  return candidates
    .map(profile => ({ profile, score: scorePolynomial(player, profile) }))
    .sort((a, b) => comparableScore(b) - comparableScore(a));
}

// Note idéale en pourcentage de la note maximale théorique du poste (un joueur noté 20
// sur chaque attribut pondéré = 100%). Renvoie null si non applicable (poste sans note
// maximale connue).
export function getIdealScorePercent(score, profile) {
  if (!profile?.maxScore) return null;
  return Math.min(100, Math.max(0, (score / profile.maxScore) * 100));
}

// Met en forme la note idéale pour l'affichage : en pourcentage de la note maximale
// théorique (un joueur noté 20 partout = 100%).
export function formatIdealScore(score, profile) {
  const percent = getIdealScorePercent(score, profile);
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
