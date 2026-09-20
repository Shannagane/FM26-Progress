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

// Schémas tactiques disponibles sur le terrain : chaque poste exact est placé en coordonnées
// (x, y) en pourcentage du terrain, y=0 en attaque, y=100 côté gardien. `defenders` (4 ou 3)
// sert à répartir les schémas entre les deux blocs de la modale Formation (voir
// DepthFormationModal.jsx) ; le premier élément du tableau est le schéma par défaut.
export const FORMATIONS = [
  {
    key: '4-4-2',
    label: '4-4-2',
    tag: 'Classique',
    defenders: 4,
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
  },
  {
    key: '4-1-2-3-ss',
    label: '4-1-2-3 Strikerless',
    tag: 'Sans buteur',
    defenders: 4,
    slots: [
      { code: 'GB', x: 50, y: 92 },
      { code: 'D(G)', x: 15, y: 72 },
      { code: 'D(C)', x: 37, y: 76 },
      { code: 'D(C)', x: 63, y: 76 },
      { code: 'D(D)', x: 85, y: 72 },
      { code: 'MD', x: 50, y: 58 },
      { code: 'M(C)', x: 32, y: 44 },
      { code: 'M(C)', x: 68, y: 44 },
      { code: 'MO(G)', x: 15, y: 18 },
      { code: 'MO(C)', x: 50, y: 22 },
      { code: 'MO(D)', x: 85, y: 18 }
    ]
  },
  {
    key: '4-2-4',
    label: '4-2-4',
    tag: 'Ultra-offensif',
    defenders: 4,
    slots: [
      { code: 'GB', x: 50, y: 92 },
      { code: 'D(G)', x: 15, y: 72 },
      { code: 'D(C)', x: 37, y: 76 },
      { code: 'D(C)', x: 63, y: 76 },
      { code: 'D(D)', x: 85, y: 72 },
      { code: 'MD', x: 37, y: 56 },
      { code: 'MD', x: 63, y: 56 },
      { code: 'MO(G)', x: 15, y: 20 },
      { code: 'BT(C)', x: 38, y: 10 },
      { code: 'BT(C)', x: 62, y: 10 },
      { code: 'MO(D)', x: 85, y: 20 }
    ]
  },
  {
    key: '4-2-3-1',
    label: '4-2-3-1',
    tag: 'Contrôle',
    defenders: 4,
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
    key: '4-4-1-1',
    label: '4-4-1-1',
    tag: 'Soutien',
    defenders: 4,
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
      { code: 'MO(C)', x: 50, y: 25 },
      { code: 'BT(C)', x: 50, y: 8 }
    ]
  },
  {
    key: '4-1-2-1-2',
    label: '4-1-2-1-2',
    tag: 'Losange étroit',
    defenders: 4,
    slots: [
      { code: 'GB', x: 50, y: 92 },
      { code: 'D(G)', x: 15, y: 72 },
      { code: 'D(C)', x: 37, y: 76 },
      { code: 'D(C)', x: 63, y: 76 },
      { code: 'D(D)', x: 85, y: 72 },
      { code: 'MD', x: 50, y: 58 },
      { code: 'M(C)', x: 35, y: 44 },
      { code: 'M(C)', x: 65, y: 44 },
      { code: 'MO(C)', x: 50, y: 26 },
      { code: 'BT(C)', x: 38, y: 10 },
      { code: 'BT(C)', x: 62, y: 10 }
    ]
  },
  {
    key: '3-4-2-1',
    label: '3-4-2-1',
    tag: 'Créatif',
    defenders: 3,
    slots: [
      { code: 'GB', x: 50, y: 92 },
      { code: 'D(C)', x: 30, y: 76 },
      { code: 'D(C)', x: 50, y: 79 },
      { code: 'D(C)', x: 70, y: 76 },
      { code: 'AL(G)', x: 13, y: 48 },
      { code: 'M(C)', x: 38, y: 46 },
      { code: 'M(C)', x: 62, y: 46 },
      { code: 'AL(D)', x: 87, y: 48 },
      { code: 'MO(G)', x: 38, y: 22 },
      { code: 'MO(D)', x: 62, y: 22 },
      { code: 'BT(C)', x: 50, y: 8 }
    ]
  },
  {
    key: '3-4-3',
    label: '3-4-3',
    tag: 'Ailes larges',
    defenders: 3,
    slots: [
      { code: 'GB', x: 50, y: 92 },
      { code: 'D(C)', x: 30, y: 76 },
      { code: 'D(C)', x: 50, y: 79 },
      { code: 'D(C)', x: 70, y: 76 },
      { code: 'AL(G)', x: 13, y: 48 },
      { code: 'M(C)', x: 38, y: 46 },
      { code: 'M(C)', x: 62, y: 46 },
      { code: 'AL(D)', x: 87, y: 48 },
      { code: 'MO(G)', x: 15, y: 16 },
      { code: 'BT(C)', x: 50, y: 8 },
      { code: 'MO(D)', x: 85, y: 16 }
    ]
  },
  {
    key: '3-5-2',
    label: '3-5-2',
    tag: 'Pressing',
    defenders: 3,
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
    key: '5-2-1-2',
    label: '5-2-1-2',
    tag: 'Bloc bas',
    defenders: 3,
    slots: [
      { code: 'GB', x: 50, y: 92 },
      { code: 'D(C)', x: 30, y: 76 },
      { code: 'D(C)', x: 50, y: 79 },
      { code: 'D(C)', x: 70, y: 76 },
      { code: 'AL(G)', x: 10, y: 64 },
      { code: 'AL(D)', x: 90, y: 64 },
      { code: 'MD', x: 37, y: 52 },
      { code: 'MD', x: 63, y: 52 },
      { code: 'MO(C)', x: 50, y: 26 },
      { code: 'BT(C)', x: 38, y: 10 },
      { code: 'BT(C)', x: 62, y: 10 }
    ]
  },
  {
    key: '5-2-3',
    label: '5-2-3',
    tag: 'Contre',
    defenders: 3,
    slots: [
      { code: 'GB', x: 50, y: 92 },
      { code: 'D(C)', x: 30, y: 76 },
      { code: 'D(C)', x: 50, y: 79 },
      { code: 'D(C)', x: 70, y: 76 },
      { code: 'AL(G)', x: 10, y: 64 },
      { code: 'AL(D)', x: 90, y: 64 },
      { code: 'M(C)', x: 38, y: 48 },
      { code: 'M(C)', x: 62, y: 48 },
      { code: 'MO(G)', x: 15, y: 16 },
      { code: 'BT(C)', x: 50, y: 8 },
      { code: 'MO(D)', x: 85, y: 16 }
    ]
  },
  {
    key: '3-2-4-1',
    label: '3-2-4-1',
    tag: 'Domination',
    defenders: 3,
    slots: [
      { code: 'GB', x: 50, y: 92 },
      { code: 'D(C)', x: 30, y: 76 },
      { code: 'D(C)', x: 50, y: 79 },
      { code: 'D(C)', x: 70, y: 76 },
      { code: 'MD', x: 37, y: 58 },
      { code: 'MD', x: 63, y: 58 },
      { code: 'MO(G)', x: 15, y: 26 },
      { code: 'M(C)', x: 38, y: 30 },
      { code: 'M(C)', x: 62, y: 30 },
      { code: 'MO(D)', x: 85, y: 26 },
      { code: 'BT(C)', x: 50, y: 8 }
    ]
  }
];

export const FOUR_DEFENDER_FORMATIONS = FORMATIONS.filter(f => f.defenders === 4);
export const THREE_DEFENDER_FORMATIONS = FORMATIONS.filter(f => f.defenders === 3);
