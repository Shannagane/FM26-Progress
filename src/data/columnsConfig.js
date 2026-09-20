// Colonnes personnalisables du tableau Effectif. "Joueur", "Meilleur poste" et "Club"
// restent des colonnes structurelles gérées directement par SquadTable/PlayerRow ; tout le
// reste (infos, stats de saison, attributs) peut être affiché ou masqué depuis le menu
// "Éditer le tableau".
import { IDENTITY_FIELDS } from './fieldsConfig.js';
import {
  TECHNIQUE_ATTRS, SET_PIECES_ATTRS, MENTAL_ATTRS, PHYSIQUE_ATTRS, GARDIEN_ONLY_ATTRS
} from './attributesConfig.js';
import { parseNumericValue } from '../utils/text.js';
import { parseTransferValue, formatTransferValue } from '../utils/transferValue.js';

const CORE_IDENTITY_KEYS = new Set(['nom', 'poste', 'club', 'photo', 'uid']);

const NUMERIC_IDENTITY_KEYS = new Set([
  'numero', 'age', 'matchs_joues', 'passes_decisives', 'buts', 'xg',
  'passes_attendues', 'temps_de_jeu', 'note_moyenne', 'buts_encaisses', 'cages_inviolees'
]);

export const INFOS_GROUP = 'Infos & stats';

export const IDENTITY_COLUMNS = IDENTITY_FIELDS
  .filter(f => !CORE_IDENTITY_KEYS.has(f.key))
  .map(f => {
    if (f.key === 'valeur_transfert') {
      return {
        key: f.key,
        label: f.label,
        group: INFOS_GROUP,
        numeric: true,
        getSortValue: player => parseTransferValue(player[f.key]),
        getDisplayValue: player => formatTransferValue(player[f.key])
      };
    }
    const numeric = NUMERIC_IDENTITY_KEYS.has(f.key);
    return {
      key: f.key,
      label: f.label,
      group: INFOS_GROUP,
      numeric,
      getSortValue: numeric
        ? player => parseNumericValue(player[f.key])
        : player => player[f.key] || '',
      getDisplayValue: player => player[f.key] || '–'
    };
  });

function attrColumns(attrs, group) {
  return attrs.map(a => ({
    key: `attr:${a.key}`,
    label: a.label,
    group,
    numeric: true,
    getSortValue: player => parseNumericValue(player.attributes?.[a.key]),
    getDisplayValue: player => player.attributes?.[a.key] ?? '–'
  }));
}

export const ATTRIBUTE_COLUMNS = [
  ...attrColumns(TECHNIQUE_ATTRS, 'Technique'),
  ...attrColumns(SET_PIECES_ATTRS, 'Coups de pied arrêtés'),
  ...attrColumns(MENTAL_ATTRS, 'Mental'),
  ...attrColumns(PHYSIQUE_ATTRS, 'Physique'),
  ...attrColumns(GARDIEN_ONLY_ATTRS, 'Gardien')
];

export const ALL_COLUMNS = [...IDENTITY_COLUMNS, ...ATTRIBUTE_COLUMNS];
export const COLUMN_BY_KEY = Object.fromEntries(ALL_COLUMNS.map(c => [c.key, c]));

export const COLUMN_GROUPS = [
  INFOS_GROUP, 'Technique', 'Coups de pied arrêtés', 'Mental', 'Physique', 'Gardien'
];

// Tableau par défaut = ce que l'application affichait avant que les colonnes soient personnalisables.
export const DEFAULT_COLUMN_KEYS = ['position', 'age', 'matchs_joues', 'buts', 'passes_decisives', 'note_moyenne'];
