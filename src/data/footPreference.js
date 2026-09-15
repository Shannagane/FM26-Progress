import { normalize } from '../utils/text.js';

// Barème des valeurs "Pied gauche" / "Pied droit" du CSV FM26 (texte -> note 1-5).
const FOOT_VALUE_MAP = {
  'tres fort': 5,
  'tres bonne': 4,
  'assez fort': 3,
  correcte: 2,
  faible: 1
};

function footValue(raw) {
  if (!raw) return null;
  const value = FOOT_VALUE_MAP[normalize(raw)];
  return value === undefined ? null : value;
}

// Compare les deux pieds et détermine le pied dominant et l'intensité de la préférence,
// indépendamment du côté final affiché (voir describeFoot).
function classifyFoot(right, left) {
  if (right === 5 && left === 5) return { type: 'ambidextre-fort' };
  const diff = right - left;
  if (diff >= 3) return { dominantFoot: 'right', strength: 'pure' };
  if (diff === 2) return { dominantFoot: 'right', strength: 'priority' };
  if (diff === 1) return { dominantFoot: 'right', strength: 'comfortable' };
  if (diff <= -3) return { dominantFoot: 'left', strength: 'pure' };
  if (diff === -2) return { dominantFoot: 'left', strength: 'priority' };
  if (diff === -1) return { dominantFoot: 'left', strength: 'comfortable' };
  return { type: 'ambidextre' };
}

// Phrases naturelles par (pied dominant, intensité), en version normale (joue du côté de
// son pied fort) et inversée (Ailier Intérieur : rentre dans l'axe depuis le côté opposé).
const SENTENCES = {
  right: {
    pure: {
      normal: "Pied droit exclusif — ne joue que sur le côté droit.",
      inverted: "Pied droit exclusif — à faire jouer côté gauche pour rentrer dans l'axe."
    },
    priority: {
      normal: "Nettement plus fort du pied droit — à privilégier côté droit.",
      inverted: "Nettement plus fort du pied droit — à privilégier côté gauche pour rentrer dans l'axe."
    },
    comfortable: {
      normal: "Plutôt droitier, mais à l'aise aussi à gauche.",
      inverted: "Plutôt droitier — peut aussi rentrer depuis la gauche."
    }
  },
  left: {
    pure: {
      normal: "Pied gauche exclusif — ne joue que sur le côté gauche.",
      inverted: "Pied gauche exclusif — à faire jouer côté droit pour rentrer dans l'axe."
    },
    priority: {
      normal: "Nettement plus fort du pied gauche — à privilégier côté gauche.",
      inverted: "Nettement plus fort du pied gauche — à privilégier côté droit pour rentrer dans l'axe."
    },
    comfortable: {
      normal: "Plutôt gaucher, mais à l'aise aussi à droite.",
      inverted: "Plutôt gaucher — peut aussi rentrer depuis la droite."
    }
  }
};

// Calcule la préférence de pied d'un joueur à partir de "Pied droit"/"Pied gauche" et la
// décrit sous une forme prête à afficher : { footLabel, side, sentence, intensity }.
// `invertSide` inverse le côté recommandé (rôle d'Ailier Intérieur) sans changer la
// description du pied dominant réel. Renvoie null si les deux valeurs ne sont pas
// exploitables.
export function describeFootPreference(player, invertSide = false) {
  const right = footValue(player.pied_droit);
  const left = footValue(player.pied_gauche);
  if (right === null || left === null) return null;

  const classification = classifyFoot(right, left);

  if (classification.type === 'ambidextre-fort') {
    return {
      footLabel: 'Ambidextre',
      side: 'both',
      sideLabel: 'Les deux côtés',
      intensity: 'ambidextre',
      sentence: 'Ambidextre confirmé — excellent des deux pieds, jouable des deux côtés.'
    };
  }
  if (classification.type === 'ambidextre') {
    return {
      footLabel: 'Équilibré',
      side: 'both',
      sideLabel: 'Les deux côtés',
      intensity: 'ambidextre',
      sentence: 'Pieds équilibrés — jouable des deux côtés.'
    };
  }

  const { dominantFoot, strength } = classification;
  const side = invertSide ? (dominantFoot === 'right' ? 'left' : 'right') : dominantFoot;
  return {
    footLabel: dominantFoot === 'right' ? 'Droitier' : 'Gaucher',
    side,
    sideLabel: side === 'right' ? 'Droit' : 'Gauche',
    intensity: strength,
    sentence: SENTENCES[dominantFoot][strength][invertSide ? 'inverted' : 'normal']
  };
}

// Postes "larges" pour lesquels la vérification de pied s'applique, par méthode
// (Latéral Offensif / Latéral / Ailier pour la méthode polynomiale, équivalents FM26).
export const FOOT_CHECK_POSITION_KEYS = {
  polynomial: ['dlr', 'wblr', 'amlr'],
  fm26: ['fb', 'wb', 'winger']
};

// Poste "Ailier" (extérieur) de chaque méthode : celui pour lequel on affiche aussi la
// variante "Ailier Intérieur" (logique de pied inversée).
export const WINGER_POSITION_KEY = {
  polynomial: 'amlr',
  fm26: 'winger'
};
