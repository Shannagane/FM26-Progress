// Libellés complets des postes exacts (colonne "M. Poste" du CSV), pour l'affichage sur le
// terrain de la page Profondeur d'effectif.
export const EXACT_POSITION_LABELS = {
  'GB': 'Gardien',
  'D(C)': 'Défenseur central',
  'D(D)': 'Arrière droit',
  'D(G)': 'Arrière gauche',
  'AL(D)': 'Piston droit',
  'AL(G)': 'Piston gauche',
  'MD': 'Milieu défensif',
  'M(D)': 'Milieu droit',
  'M(C)': 'Milieu central',
  'M(G)': 'Milieu gauche',
  'MO(D)': 'Ailier droit',
  'MO(C)': 'Milieu offensif',
  'MO(G)': 'Ailier gauche',
  'BT(C)': 'Avant-centre'
};

// Correspondance poste exact -> groupe de poids, pour chaque méthode de notation du Labo des
// Postes (les clés doivent correspondre à celles de FM26_PROFILES / POLYNOMIAL_PROFILES dans
// newgensPositionProfiles.js). La méthode FM26 fusionne milieu défensif et milieu central
// dans un seul groupe ("cm") ; la méthode FM23/FM24 les distingue ("mdc" vs "mc").
export const EXACT_CODE_TO_GROUP = {
  fm26: {
    'GB': 'gk',
    'D(C)': 'cb',
    'D(D)': 'fb',
    'D(G)': 'fb',
    'AL(D)': 'wb',
    'AL(G)': 'wb',
    'MD': 'cm',
    'M(C)': 'cm',
    'M(D)': 'winger',
    'M(G)': 'winger',
    'MO(D)': 'winger',
    'MO(G)': 'winger',
    'MO(C)': 'am',
    'BT(C)': 'st'
  },
  polynomial: {
    'GB': 'gk',
    'D(C)': 'dc',
    'D(D)': 'dlr',
    'D(G)': 'dlr',
    'AL(D)': 'wblr',
    'AL(G)': 'wblr',
    'MD': 'mdc',
    'M(C)': 'mc',
    'M(D)': 'amlr',
    'M(G)': 'amlr',
    'MO(D)': 'amlr',
    'MO(G)': 'amlr',
    'MO(C)': 'amc',
    'BT(C)': 'stc'
  }
};

// Postes "de dépannage" par poste exact : un joueur n'occupant pas nativement ce poste peut
// quand même y être proposé en renfort d'urgence (derrière les joueurs au poste exact), noté
// avec les poids du poste ciblé plutôt que les siens.
export const POSITION_FALLBACKS = {
  'GB': [],
  'D(C)': ['MD'],
  'D(D)': ['AL(D)'],
  'D(G)': ['AL(G)'],
  'AL(D)': ['D(D)', 'MO(D)'],
  'AL(G)': ['D(G)', 'MO(G)'],
  'MD': ['M(C)'],
  'M(D)': ['MO(D)', 'AL(D)'],
  'M(C)': ['MD', 'M(D)', 'M(G)'],
  'M(G)': ['MO(G)', 'AL(G)'],
  'MO(D)': ['M(D)', 'AL(D)'],
  'MO(C)': ['M(C)'],
  'MO(G)': ['M(G)', 'AL(G)'],
  'BT(C)': ['MO(C)']
};

// Schémas tactiques disponibles sur le terrain : chaque poste exact est placé en coordonnées
// (x, y) en pourcentage du terrain, y=0 en attaque, y=100 côté gardien.
export const FORMATIONS = [
  {
    key: '4-3-3',
    label: '4-3-3',
    tag: 'Équilibré',
    slots: [
      { code: 'GB', x: 50, y: 92 },
      { code: 'D(G)', x: 15, y: 72 },
      { code: 'D(C)', x: 37, y: 76 },
      { code: 'D(C)', x: 63, y: 76 },
      { code: 'D(D)', x: 85, y: 72 },
      { code: 'MD', x: 50, y: 56 },
      { code: 'M(C)', x: 32, y: 43 },
      { code: 'M(C)', x: 68, y: 43 },
      { code: 'MO(G)', x: 15, y: 16 },
      { code: 'MO(D)', x: 85, y: 16 },
      { code: 'BT(C)', x: 50, y: 8 }
    ]
  },
  {
    key: '4-2-3-1',
    label: '4-2-3-1',
    tag: 'Contrôle',
    slots: [
      { code: 'GB', x: 50, y: 92 },
      { code: 'D(G)', x: 15, y: 72 },
      { code: 'D(C)', x: 37, y: 76 },
      { code: 'D(C)', x: 63, y: 76 },
      { code: 'D(D)', x: 85, y: 72 },
      { code: 'MD', x: 37, y: 56 },
      { code: 'MD', x: 63, y: 56 },
      { code: 'MO(G)', x: 15, y: 29 },
      { code: 'MO(C)', x: 50, y: 25 },
      { code: 'MO(D)', x: 85, y: 29 },
      { code: 'BT(C)', x: 50, y: 8 }
    ]
  },
  {
    key: '3-5-2',
    label: '3-5-2',
    tag: 'Pressing',
    slots: [
      { code: 'GB', x: 50, y: 92 },
      { code: 'D(C)', x: 30, y: 76 },
      { code: 'D(C)', x: 50, y: 79 },
      { code: 'D(C)', x: 70, y: 76 },
      { code: 'AL(G)', x: 13, y: 48 },
      { code: 'M(C)', x: 38, y: 46 },
      { code: 'MD', x: 50, y: 53 },
      { code: 'M(C)', x: 62, y: 46 },
      { code: 'AL(D)', x: 87, y: 48 },
      { code: 'BT(C)', x: 38, y: 12 },
      { code: 'BT(C)', x: 62, y: 12 }
    ]
  },
  {
    key: '4-4-2',
    label: '4-4-2',
    tag: 'Classique',
    slots: [
      { code: 'GB', x: 50, y: 92 },
      { code: 'D(G)', x: 15, y: 72 },
      { code: 'D(C)', x: 37, y: 76 },
      { code: 'D(C)', x: 63, y: 76 },
      { code: 'D(D)', x: 85, y: 72 },
      { code: 'M(G)', x: 15, y: 46 },
      { code: 'M(C)', x: 38, y: 49 },
      { code: 'M(C)', x: 62, y: 49 },
      { code: 'M(D)', x: 85, y: 46 },
      { code: 'BT(C)', x: 38, y: 12 },
      { code: 'BT(C)', x: 62, y: 12 }
    ]
  }
];
