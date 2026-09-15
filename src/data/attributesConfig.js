// Définition de tous les attributs suivis, avec :
// - key : clé interne unique
// - label : libellé affiché
// - aliases : en-têtes CSV possibles (le nom exact demandé + variantes usuelles/abréviations FM)
// Les catégories techniques + coups de pied arrêtés sont fusionnées dans une seule
// colonne d'affichage pour les joueurs de champ, comme demandé.

function attr(key, label, aliases = []) {
  return { key, label, aliases: [label, ...aliases] };
}

export const TECHNIQUE_ATTRS = [
  attr('centre', 'Centre', ['Cro', 'Centres']),
  attr('controle_balle', 'Contrôle de balle', ['Con', 'First Touch', 'Ctrl']),
  attr('dribbles', 'Dribbles', ['Dri']),
  attr('finition', 'Finition', ['Fin']),
  attr('jeu_de_tete', 'Jeu de tête', ['Hea', 'Jeu de tete']),
  attr('marquage', 'Marquage', ['Mar']),
  attr('passes', 'Passes', ['Pas']),
  attr('tacles', 'Tacles', ['Tck']),
  attr('technique', 'Technique', ['Tec']),
  attr('tir_de_loin', 'Tirs de loin', ['Lon', 'Tirs de loin', 'Tir de loin'])
];

export const SET_PIECES_ATTRS = [
  attr('corners', 'Corners', ['Cor']),
  attr('coups_francs', 'Coups Francs', ['Cou', 'FK']),
  attr('penalty', 'Penalty', ['Pen']),
  attr('touches longues', 'Touches longues', ['Touches longues', 'Touches longues'])
];

export const MENTAL_ATTRS = [
  attr('agressivite', 'Agressivité', ['Agg']),
  attr('anticipation', 'Anticipation', ['Ant']),
  attr('appels_de_balle', 'Appels de balle', ['OtB', 'Off the Ball']),
  attr('concentration', 'Concentration', ['Cnt']),
  attr('courage', 'Courage', ['Bra']),
  attr('decisions', 'Décisions', ['Dec']),
  attr('determination', 'Détermination', ['Det']),
  attr('inspiration', 'Inspiration', ['Fla', 'Flair']),
  attr('Travail d\'équipe', 'Jeu collectif', ['Travail d\'équipe', 'Travail d\'équipe']),
  attr('leadership', 'Leadership', ['Ldr']),
  attr('placement', 'Placement', ['Pos']),
  attr('sang_froid', 'Sang-froid', ['Cmp', 'Composure']),
  attr('vision_du_jeu', 'Vision du jeu', ['Vis']),
  attr('volume_de_jeu', 'Volume de jeu', ['Wor', 'Work Rate'])
];

export const PHYSIQUE_ATTRS = [
  attr('acceleration', 'Accélération', ['Acc']),
  attr('agilite', 'Agilité', ['Agi']),
  attr('detente_verticale', 'Détente verticale', ['Jum', 'Jumping Reach']),
  attr('endurance', 'Endurance', ['Endurance']),
  attr('equilibre', 'Equilibre', ['Équilibre']),
  attr('puissance', 'Puissance', ['Str', 'Strength']),
  attr('Qualités phys. nat.', 'Qualités phys. nat.', ['Nat', 'Natural Fitness', 'Qualité phys.nat.', 'Qualité phys. nat.']),
  attr('vitesse', 'Vitesse', ['Pac', 'Vitessse'])
];

// Attributs gardien qui ne sont PAS déjà dans la Technique (controle_balle et passes
// sont partagés et référencés depuis TECHNIQUE_ATTRS)
export const GARDIEN_ONLY_ATTRS = [
  attr('communication', 'Communication', ['Com']),
  attr('degagement_au_poing', 'Dégagement au poing (tendance)', ['Dégagements au poing', 'Punching']),
  attr('degagements', 'Dégagements', ['Kic', 'Kicking']),
  attr('detente', 'Détente', ['Aer', 'Aerial Reach']),
  attr('excentricite', 'Excentricité', ['Ecc', 'Eccentricity']),
  attr('prises_de_balle', 'Prises de balle', ['Han', 'Handling']),
  attr('reflexes', 'Réflexes', ['Ref']),
  attr('relance_a_la_main', 'Relance à la main', ['Relances à la main', 'Throwing']),
  attr('sorties_dans_la_surface', 'Sorties dans la surface', ['Cmd', 'Command of Area']),
  attr('sorties_dans_les_pieds', 'Sorties dans les pieds (tendance)', ['TRO', 'Rushing Out']),
  attr('un_contre_un', 'Un contre un', ['1v1', 'One on Ones'])
];

// Tableau "Gardien" complet dans l'ordre demandé (avec renvoi vers les clés partagées)
export const GARDIEN_ATTRS = [
  GARDIEN_ONLY_ATTRS[0], // Communication
  TECHNIQUE_ATTRS.find(a => a.key === 'controle_balle'),
  GARDIEN_ONLY_ATTRS[1], // Dégagement au poing
  GARDIEN_ONLY_ATTRS[2], // Dégagements
  GARDIEN_ONLY_ATTRS[3], // Détente
  GARDIEN_ONLY_ATTRS[4], // Excentricité
  TECHNIQUE_ATTRS.find(a => a.key === 'passes'),
  GARDIEN_ONLY_ATTRS[5], // Prises de balle
  GARDIEN_ONLY_ATTRS[6], // Réflexes
  GARDIEN_ONLY_ATTRS[7], // Relance à la main
  GARDIEN_ONLY_ATTRS[8], // Sorties dans la surface
  GARDIEN_ONLY_ATTRS[9], // Sorties dans les pieds
  GARDIEN_ONLY_ATTRS[10] // Un contre un
];

export const ALL_ATTRS = [
  ...TECHNIQUE_ATTRS,
  ...SET_PIECES_ATTRS,
  ...MENTAL_ATTRS,
  ...PHYSIQUE_ATTRS,
  ...GARDIEN_ONLY_ATTRS
];

export const ATTR_BY_KEY = Object.fromEntries(ALL_ATTRS.map(a => [a.key, a]));

// Colonnes affichées sur la page joueur, selon le poste.
// Chaque "colonne" est elle-même une liste de tableaux empilés verticalement.
export function getAttributeColumns(isGK) {
  if (isGK) {
    return [
      [{ title: 'Gardien', attrs: GARDIEN_ATTRS }],
      [{ title: 'Mental', attrs: MENTAL_ATTRS }],
      [{ title: 'Physique', attrs: PHYSIQUE_ATTRS }]
    ];
  }
  return [
    [
      { title: 'Technique', attrs: TECHNIQUE_ATTRS },
      { title: 'Coups de pied arrêtés', attrs: SET_PIECES_ATTRS }
    ],
    [{ title: 'Mental', attrs: MENTAL_ATTRS }],
    [{ title: 'Physique', attrs: PHYSIQUE_ATTRS }]
  ];
}

// Code couleur des valeurs d'attribut (1-20)
export function attributeColorClass(value) {
  const v = Number(value);
  if (Number.isNaN(v)) return 'attr-empty';
  if (v >= 16) return 'attr-green';
  if (v >= 11) return 'attr-orange';
  if (v >= 6) return 'attr-white';
  return 'attr-grey';
}
